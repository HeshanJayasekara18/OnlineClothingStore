using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ClothStoreApi.Models;
using ClothStoreApi.Services;
using Google.Apis.Auth;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CustomerService _customerService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(CustomerService customerService, ILogger<AuthController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        // -------------------- Initiate Google Login --------------------
        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            _logger.LogInformation("Initiating Google OAuth login");
            var redirectUrl = Url.Action("GoogleCallback", "Auth");
            var properties = new AuthenticationProperties { RedirectUri = redirectUrl };

            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        // -------------------- Google Callback --------------------
        [HttpGet("~/signin-google")]
        public async Task<IActionResult> GoogleCallback()
        {
            _logger.LogInformation("Processing Google OAuth callback");
            
            var result = await HttpContext.AuthenticateAsync(GoogleDefaults.AuthenticationScheme);

            if (!result.Succeeded || result.Principal == null)
            {
                _logger.LogWarning("Google OAuth authentication failed");
                return Redirect("http://localhost:3000/auth?error=auth_failed");
            }

            var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;
            var givenName = result.Principal.FindFirst(ClaimTypes.GivenName)?.Value;
            var surname = result.Principal.FindFirst(ClaimTypes.Surname)?.Value;
            var picture = result.Principal.FindFirst("picture")?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("Google OAuth - No email claim received");
                return Redirect("http://localhost:3000/auth?error=no_email");
            }

            _logger.LogInformation("Google OAuth successful for email: {Email}", email);

            // Find or create user
            var user = await _customerService.GetByEmailAsync(email);
            if (user == null)
            {
                user = new Customer
                {
                    Email = email,
                    FirstName = givenName ?? name?.Split(' ').First() ?? "User",
                    LastName = surname ?? name?.Split(' ').Last() ?? "",
                    Name = name ?? $"{givenName} {surname}",
                    Password = "google_oauth",
                    Picture = picture
                };
                
                _logger.LogInformation("Creating new customer for Google OAuth user: {Email}", email);
                await _customerService.CreateAsync(user);
            }

            var userData = new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Picture
            };

            // Serialize user info for frontend
            var userJson = System.Web.HttpUtility.UrlEncode(
                System.Text.Json.JsonSerializer.Serialize(userData)
            );

            _logger.LogInformation("Google OAuth completed, redirecting to frontend for user: {Email}", email);
            
            // Sign in the user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Name, name ?? ""),
                new Claim("picture", picture ?? "")
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                RedirectUri = "/"
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            return Redirect($"http://localhost:3000/home?user={userJson}");
        }

        // -------------------- Logout --------------------
        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
            _logger.LogInformation("Logging out user");
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }

        // -------------------- Verify Token (optional) --------------------
        [HttpPost("verify-token")]
        public async Task<IActionResult> VerifyToken([FromBody] TokenRequest tokenRequest)
        {
            try
            {
                _logger.LogInformation("Verifying Google ID token");
                var payload = await GoogleJsonWebSignature.ValidateAsync(tokenRequest.Token);
                _logger.LogInformation("Google token verified for email: {Email}", payload.Email);
                
                // Find or create user
                var user = await _customerService.GetByEmailAsync(payload.Email);
                if (user == null)
                {
                    user = new Customer
                    {
                        Email = payload.Email,
                        FirstName = payload.GivenName ?? payload.Name?.Split(' ').First() ?? "User",
                        LastName = payload.FamilyName ?? payload.Name?.Split(' ').Last() ?? "",
                        Name = payload.Name,
                        Password = "google_oauth",
                        Picture = payload.Picture
                    };
                    await _customerService.CreateAsync(user);
                }

                return Ok(new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Picture
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation failed");
                return BadRequest("Invalid token");
            }
        }

        // -------------------- Forgot Password --------------------
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                var user = await _customerService.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    // Don't reveal if email exists or not for security
                    return Ok(new { message = "If the email exists, a reset code has been sent." });
                }

                // Generate 6-digit code
                var resetCode = new Random().Next(100000, 999999).ToString();
                
                // Set expiry to 15 minutes from now
                user.ResetCode = resetCode;
                user.ResetCodeExpiry = DateTime.UtcNow.AddMinutes(15);
                
                await _customerService.UpdateAsync(user.Id!, user);

                // In production, send email here
                // For now, log it (you can see it in console)
                _logger.LogInformation("Password reset code for {Email}: {Code}", request.Email, resetCode);
                
                // TODO: Send email with reset code
                // await _emailService.SendResetCodeAsync(request.Email, resetCode);

                return Ok(new { 
                    message = "Reset code sent to your email",
                    // Remove this in production - only for testing
                    code = resetCode 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in forgot password");
                return StatusCode(500, "An error occurred");
            }
        }

        // -------------------- Verify Reset Code --------------------
        [HttpPost("verify-reset-code")]
        public async Task<IActionResult> VerifyResetCode([FromBody] VerifyCodeRequest request)
        {
            try
            {
                var user = await _customerService.GetByEmailAsync(request.Email);
                if (user == null || string.IsNullOrEmpty(user.ResetCode))
                {
                    return BadRequest(new { message = "Invalid request" });
                }

                // Check if code matches and hasn't expired
                if (user.ResetCode != request.Code)
                {
                    return BadRequest(new { message = "Invalid reset code" });
                }

                if (user.ResetCodeExpiry < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Reset code has expired" });
                }

                return Ok(new { message = "Code verified successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying reset code");
                return StatusCode(500, "An error occurred");
            }
        }

        // -------------------- Reset Password --------------------
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                var user = await _customerService.GetByEmailAsync(request.Email);
                if (user == null || string.IsNullOrEmpty(user.ResetCode))
                {
                    return BadRequest(new { message = "Invalid request" });
                }

                // Verify code again
                if (user.ResetCode != request.Code || user.ResetCodeExpiry < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Invalid or expired reset code" });
                }

                // Update password (stored as plain text in current implementation)
                // TODO: In production, hash the password using BCrypt or similar
                user.Password = request.NewPassword;
                
                // Clear reset code
                user.ResetCode = null;
                user.ResetCodeExpiry = null;
                
                await _customerService.UpdateAsync(user.Id!, user);

                _logger.LogInformation("Password reset successful for {Email}", request.Email);

                return Ok(new { message = "Password reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, "An error occurred");
            }
        }

        // -------------------- Request Models --------------------
        public class TokenRequest
        {
            public string Token { get; set; } = null!;
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; } = null!;
        }

        public class VerifyCodeRequest
        {
            public string Email { get; set; } = null!;
            public string Code { get; set; } = null!;
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; } = null!;
            public string Code { get; set; } = null!;
            public string NewPassword { get; set; } = null!;
        }
    }
}