using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ClothStoreApi.Models;
using ClothStoreApi.Services;

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

        // -------------------- Login --------------------
        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = "/api/auth/google-callback"
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        // -------------------- Callback --------------------
        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded || result.Principal == null)
                return Redirect("/login?error=auth_failed");

            var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var givenName = result.Principal.FindFirst(ClaimTypes.GivenName)?.Value;
            var surname = result.Principal.FindFirst(ClaimTypes.Surname)?.Value;
            var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;
            var picture = result.Principal.FindFirst("urn:google:picture")?.Value;

            if (string.IsNullOrEmpty(email))
                return Redirect("/login?error=no_email");

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
                await _customerService.CreateAsync(user);
            }

            // Redirect to frontend with user data as query param
            var userJson = System.Web.HttpUtility.UrlEncode(System.Text.Json.JsonSerializer.Serialize(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Picture
            }));

            return Redirect($"/?user={userJson}");
        }

        // -------------------- Logout --------------------
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok(new { message = "Logged out successfully" });
        }
    }
}
