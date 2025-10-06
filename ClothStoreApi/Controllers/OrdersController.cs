using Microsoft.AspNetCore.Mvc;
using ClothStoreApi.Models;
using ClothStoreApi.Services;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ILogger<OrdersController> _logger;
        private readonly OrderService _orderService;
        private readonly ProductService _productService;

        public OrdersController(OrderService orderService, ProductService productService, ILogger<OrdersController> logger)
        {
            _orderService = orderService;
            _productService = productService;
            _logger = logger;
        }

        // GET all orders
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                _logger.LogInformation("Retrieving all orders");
                var orders = await _orderService.GetAllAsync();
                _logger.LogInformation("Retrieved {Count} orders", orders.Count);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders: {Message}", ex.Message);
                return StatusCode(500, "An error occurred while retrieving orders.");
            }
        }

        // GET order by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                _logger.LogInformation("Retrieving order with ID: {OrderId}", id);
                var order = await _orderService.GetByIdAsync(id);
                if (order == null)
                {
                    _logger.LogWarning("Order with ID {OrderId} not found", id);
                    return NotFound($"Order with ID {id} not found.");
                }

                return Ok(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving order with ID {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, "An error occurred while retrieving the order.");
            }
        }

        // GET orders by customer ID
        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetByCustomer(string customerId)
        {
            try
            {
                _logger.LogInformation("Retrieving orders for customer: {CustomerId}", customerId);
                var orders = await _orderService.GetByCustomerIdAsync(customerId);
                _logger.LogInformation("Retrieved {Count} orders for customer {CustomerId}", orders.Count, customerId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders for customer {CustomerId}: {Message}", customerId, ex.Message);
                return StatusCode(500, "An error occurred while retrieving orders.");
            }
        }

        // CREATE order
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            try
            {
                if (order == null)
                    return BadRequest("Order data is null.");

                if (order.Items == null || !order.Items.Any())
                    return BadRequest("Order must contain at least one item.");

                _logger.LogInformation("Creating new order for customer: {CustomerId}", order.CustomerId);
                
                // Validate products and calculate total
                decimal total = 0;
                foreach (var item in order.Items)
                {
                    var product = await _productService.GetByIdAsync(item.ProductId);
                    if (product == null)
                    {
                        _logger.LogWarning("Product with ID {ProductId} not found for order", item.ProductId);
                        return BadRequest($"Product with ID {item.ProductId} not found.");
                    }
                    
                    item.ProductName = product.Name;
                    item.Price = product.Price;
                    total += item.Price * item.Quantity;
                }

                order.TotalAmount = total;
                await _orderService.CreateAsync(order);

                _logger.LogInformation("Order created successfully with ID: {OrderId}", order.Id);
                return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order: {Message}", ex.Message);
                return StatusCode(500, "An error occurred while creating the order.");
            }
        }

        // UPDATE order status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] string status)
        {
            try
            {
                _logger.LogInformation("Updating status for order: {OrderId} to {Status}", id, status);
                var existingOrder = await _orderService.GetByIdAsync(id);
                if (existingOrder == null)
                {
                    _logger.LogWarning("Order with ID {OrderId} not found for status update", id);
                    return NotFound($"Order with ID {id} not found.");
                }

                await _orderService.UpdateStatusAsync(id, status);
                _logger.LogInformation("Order status updated successfully for order: {OrderId}", id);
                return Ok(new { message = $"Order status updated to {status}." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status for ID {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, "An error occurred while updating the order status.");
            }
        }

        // DELETE order
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                _logger.LogInformation("Deleting order with ID: {OrderId}", id);
                var existingOrder = await _orderService.GetByIdAsync(id);
                if (existingOrder == null)
                {
                    _logger.LogWarning("Order with ID {OrderId} not found for deletion", id);
                    return NotFound($"Order with ID {id} not found.");
                }

                await _orderService.DeleteAsync(id);
                _logger.LogInformation("Order with ID {OrderId} deleted successfully", id);
                return Ok(new { message = $"Order with ID {id} deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting order with ID {OrderId}: {Message}", id, ex.Message);
                return StatusCode(500, "An error occurred while deleting the order.");
            }
        }
    }
}