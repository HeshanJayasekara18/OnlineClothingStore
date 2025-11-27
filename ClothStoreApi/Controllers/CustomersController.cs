using ClothStoreApi.Models;
using ClothStoreApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(CustomerService customerService, ILogger<CustomersController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        // -------------------- Get All Customers --------------------
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                _logger.LogInformation("Retrieving all customers");
                var customers = await _customerService.GetAllAsync();
                _logger.LogInformation("Retrieved {Count} customers", customers.Count);
                return Ok(customers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customers");
                return StatusCode(500, "An error occurred while retrieving customers.");
            }
        }

        // -------------------- Get Customer by ID --------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid customer ID.");

            try
            {
                _logger.LogInformation("Retrieving customer with ID: {CustomerId}", id);
                var customer = await _customerService.GetAsync(id);
                if (customer == null)
                {
                    _logger.LogWarning("Customer with ID {CustomerId} not found", id);
                    return NotFound($"Customer with ID {id} not found.");
                }

                return Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer with ID {CustomerId}", id);
                return StatusCode(500, "An error occurred while retrieving the customer.");
            }
        }

        // -------------------- Register --------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Customer customer)
        {
            if (customer == null)
                return BadRequest("Customer data is required.");

            if (string.IsNullOrWhiteSpace(customer.Email) || string.IsNullOrWhiteSpace(customer.Password))
                return BadRequest("Email and Password are required.");

            try
            {
                _logger.LogInformation("Registering new customer with email: {Email}", customer.Email);
                
                // Check if email already exists
                var existingCustomer = await _customerService.GetByEmailAsync(customer.Email);
                if (existingCustomer != null)
                {
                    _logger.LogWarning("Registration failed - email already exists: {Email}", customer.Email);
                    return BadRequest(new { message = "Email already registered." });
                }

                // Auto-set Name
                customer.Name = $"{customer.FirstName} {customer.LastName}".Trim();

                // Let MongoDB auto-generate Id
                customer.Id = null!;

                await _customerService.CreateAsync(customer);

                _logger.LogInformation("Customer registered successfully with ID: {CustomerId}", customer.Id);

                return CreatedAtAction(nameof(Get), new { id = customer.Id }, new
                {
                    customer.Id,
                    customer.FirstName,
                    customer.LastName,
                    customer.Name,
                    customer.Email
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering customer with email: {Email}", customer.Email);
                return StatusCode(500, "An error occurred while registering the customer.");
            }
        }

        // -------------------- Login --------------------
        public class LoginRequest
        {
            public string Email { get; set; } = null!;
            public string Password { get; set; } = null!;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginData)
        {
            if (loginData == null || string.IsNullOrWhiteSpace(loginData.Email) || string.IsNullOrWhiteSpace(loginData.Password))
                return BadRequest(new { success = false, error = "Email and password required." });

            var email = loginData.Email.ToLower().Trim();
            Customer user = null;
            try
            {
                user = await _customerService.GetByEmailAsync(email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Server error retrieving user by email: {Email}", email);
                // return JSON error, avoid plain text
                return StatusCode(500, new { success = false, error = "Server error retrieving user.", details = ex.Message });
            }

            _logger.LogInformation("Login check for {email}: userFound={found}", email, user != null);
            if (user == null)
                return Unauthorized(new { success = false, error = "Invalid credentials." });

            _logger.LogInformation("User {email} PasswordHash present: {hasHash}", email, !string.IsNullOrEmpty(user.PasswordHash));

            bool verified = false;
            try
            {
                verified = !string.IsNullOrEmpty(user.PasswordHash) && BCrypt.Net.BCrypt.Verify(loginData.Password, user.PasswordHash);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BCrypt.Verify failed for {email}", email);
            }

            if (!verified)
            {
                _logger.LogWarning("Password verification failed for {email}", email);
                return Unauthorized(new { success = false, error = "Invalid credentials." });
            }

            // Successful login — return user info (hide sensitive fields)
            var result = new
            {
                success = true,
                data = new {
                    id = user.Id,
                    email = user.Email,
                    role = user.Role,
                    name = user.Name ?? $"{user.FirstName} {user.LastName}".Trim(),
                    picture = user.Picture
                }
            };

            return Ok(result);
        }

        // -------------------- Current User --------------------
        [HttpGet("current-user")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                _logger.LogWarning("GetCurrentUser called but user is not authenticated");
                return Unauthorized();
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrEmpty(email))
            {
                _logger.LogWarning("GetCurrentUser - Email claim not found for authenticated user");
                return Unauthorized("Email claim not found");
            }

            _logger.LogInformation("Retrieving current user with email: {Email}", email);
            var user = await _customerService.GetByEmailAsync(email);
            if (user == null)
            {
                _logger.LogWarning("GetCurrentUser - User not found in database for email: {Email}", email);
                return NotFound("User not found in database");
            }

            return Ok(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Name,
                user.Email,
                user.Picture
            });
        }
    }
}

// compute bcrypt hash in C# or use AdminController to set. Example update if you already have a hash:
// NOTE: The following is a MongoDB shell command and must NOT be placed in C# source.
// Run it in the mongo shell or a MongoDB client instead:
//
// db.Customers.updateOne(
//   { email: "heshan@gmail.com" },
//   { $set: { PasswordHash: "<bcrypt-hash-here>", Role: "Admin" } }
// );