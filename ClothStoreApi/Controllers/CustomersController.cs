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
                var customers = await _customerService.GetAsync();
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

        // New Login Endpoint
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] Customer loginData)
        {
            if (loginData == null || string.IsNullOrEmpty(loginData.Email) || string.IsNullOrEmpty(loginData.Password))
                return BadRequest("Email and Password are required.");

            try
            {
                var customer = await _customerService.GetByEmailAsync(loginData.Email);
                if (customer == null)
                    return Unauthorized("Invalid email or password.");

                if (customer.Password != loginData.Password)
                    return Unauthorized("Invalid email or password.");

                // Return customer info (in production, generate JWT token instead)
                return Ok(new 
                { 
                    Id = customer.Id, 
                    FirstName = customer.FirstName, 
                    LastName = customer.LastName, 
                    Email = customer.Email 
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
