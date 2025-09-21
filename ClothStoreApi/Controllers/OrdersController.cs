using ClothStoreApi.Data;
using ClothStoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly StoreContext _context;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(StoreContext context, ILogger<OrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var orders = await _context.Orders.ToListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, "An error occurred while retrieving orders.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid order ID.");

                var order = await _context.Orders.FindAsync(id);
                
                if (order == null) 
                    return NotFound($"Order with ID {id} not found.");
                
                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order with ID {OrderId}", id);
                return StatusCode(500, "An error occurred while retrieving the order.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (order == null)
                    return BadRequest("Order data is required.");

                // Validate that customer exists if CustomerId is provided
                if (order.CustomerId > 0)
                {
                    var customerExists = await _context.Customers.AnyAsync(c => c.Id == order.CustomerId);
                    if (!customerExists)
                        return BadRequest($"Customer with ID {order.CustomerId} does not exist.");
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Order created with ID {OrderId}", order.Id);
                return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, "An error occurred while creating the order.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Order order)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid order ID.");

                if (order == null)
                    return BadRequest("Order data is required.");

                if (id != order.Id)
                    return BadRequest("Order ID mismatch.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check if order exists
                var existingOrder = await _context.Orders.FindAsync(id);
                if (existingOrder == null)
                    return NotFound($"Order with ID {id} not found.");

                // Validate that customer exists if CustomerId is provided
                if (order.CustomerId > 0)
                {
                    var customerExists = await _context.Customers.AnyAsync(c => c.Id == order.CustomerId);
                    if (!customerExists)
                        return BadRequest($"Customer with ID {order.CustomerId} does not exist.");
                }

                _context.Entry(existingOrder).CurrentValues.SetValues(order);

                try
                {
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Order updated with ID {OrderId}", id);
                }
                catch (DbUpdateConcurrencyException)
                {
                    // Fixed: Check Orders table instead of Customers
                    if (!await _context.Orders.AnyAsync(e => e.Id == id))
                        return NotFound($"Order with ID {id} not found.");
                    else
                        throw;
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order with ID {OrderId}", id);
                return StatusCode(500, "An error occurred while updating the order.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid order ID.");

                var order = await _context.Orders.FindAsync(id);
                if (order == null)
                    return NotFound($"Order with ID {id} not found.");

                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Order deleted with ID {OrderId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting order with ID {OrderId}", id);
                return StatusCode(500, "An error occurred while deleting the order.");
            }
        }
    }
}