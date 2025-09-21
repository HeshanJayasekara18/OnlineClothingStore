using ClothStoreApi.Data;
using ClothStoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly StoreContext _context;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(StoreContext context, ILogger<CustomersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var customers = await _context.Customers.ToListAsync();
                return Ok(customers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving customers");
                return StatusCode(500, "An error occurred while retrieving customers.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid customer ID.");

                var customer = await _context.Customers.FindAsync(id);
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Customer customer)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (customer == null)
                    return BadRequest("Customer data is required.");

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Customer created with ID {CustomerId}", customer.Id);
                return CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer");
                return StatusCode(500, "An error occurred while creating the customer.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Customer customer)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid customer ID.");

                if (customer == null)
                    return BadRequest("Customer data is required.");

                if (id != customer.Id)
                    return BadRequest("Customer ID mismatch.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check if customer exists
                var existingCustomer = await _context.Customers.FindAsync(id);
                if (existingCustomer == null)
                    return NotFound($"Customer with ID {id} not found.");

                _context.Entry(existingCustomer).CurrentValues.SetValues(customer);

                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Customer updated with ID {CustomerId}", id);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!await _context.Customers.AnyAsync(e => e.Id == id))
                        return NotFound($"Customer with ID {id} not found.");
                    else
                        throw;
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer with ID {CustomerId}", id);
                return StatusCode(500, "An error occurred while updating the customer.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid customer ID.");

                var customer = await _context.Customers.FindAsync(id);
                if (customer == null)
                    return NotFound($"Customer with ID {id} not found.");

                _context.Customers.Remove(customer);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Customer deleted with ID {CustomerId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer with ID {CustomerId}", id);
                return StatusCode(500, "An error occurred while deleting the customer.");
            }
        }
    }
}