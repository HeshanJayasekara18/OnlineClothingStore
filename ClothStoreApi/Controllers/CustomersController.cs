using ClothStoreApi.Models;
using ClothStoreApi.Services;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var customers = await _customerService.GetAllAsync();
                return Ok(customers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customers");
                return StatusCode(500, "An error occurred while retrieving customers.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                return BadRequest("Invalid customer ID.");

            try
            {
                var customer = await _customerService.GetAsync(id);
                if (customer == null)
                    return NotFound($"Customer with ID {id} not found.");

                return Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customer with ID {CustomerId}", id);
                return StatusCode(500, "An error occurred while retrieving the customer.");
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] Customer customer)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (customer == null)
                return BadRequest("Customer data is required.");

            try
            {
                await _customerService.CreateAsync(customer);
                _logger.LogInformation("Customer registered with ID {CustomerId}", customer.Id);
                return CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering customer");
                return StatusCode(500, "An error occurred while registering the customer.");
            }
        }


        [HttpGet("current-user")]
        public IActionResult GetCurrentUser()
        {
            // For now, return a simple response
            // You'll implement proper session/cookie authentication later
            return Ok(new { 
                message = "Current user endpoint",
                isAuthenticated = false 
            });
        }

        // ------------------ Fixed Login Endpoint ------------------
        public class LoginRequest
        {
            public string Email { get; set; } = null!;
            public string Password { get; set; } = null!;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginData)
        {
            if (loginData == null || string.IsNullOrEmpty(loginData.Email) || string.IsNullOrEmpty(loginData.Password))
                return BadRequest("Email and Password are required.");

            try
            {
                var customer = await _customerService.GetByEmailAsync(loginData.Email);
                if (customer == null)
                    return Unauthorized("Invalid email or password.");

                if (customer.Password != loginData.Password) // replace with BCrypt.Verify if hashed
                    return Unauthorized("Invalid email or password.");

                // Return only necessary info
                return Ok(new
                {
                    Id = customer.Id,
                    FirstName = customer.FirstName ?? customer.Name,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Picture = customer.Picture
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email {Email}", loginData.Email);
                return StatusCode(500, "An error occurred while logging in.");
            }
        }
    }


}

