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
                    user.Email,
                    user.Picture
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation failed");
                return BadRequest("Invalid token");
            }
        }

        public class TokenRequest
        {
            public string Token { get; set; } = null!;
        }
    }
}