using ClothStoreApi.Models;
using ClothStoreApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderService _orderService;
        private readonly CustomerService _customerService;

        public OrdersController(OrderService orderService, CustomerService customerService)
        {
            _orderService = orderService;
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _orderService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var order = await _orderService.GetByIdAsync(id);
            return order == null ? NotFound() : Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Order order)
        {
            if (order == null) return BadRequest();

            if (!string.IsNullOrEmpty(order.CustomerId))
            {
                var customer = await _customerService.GetAsync(order.CustomerId);
                if (customer == null) return BadRequest($"Customer {order.CustomerId} does not exist.");
            }

            await _orderService.CreateAsync(order);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Order order)
        {
            if (order == null || id != order.Id) return BadRequest();

            var existing = await _orderService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _orderService.UpdateAsync(id, order);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _orderService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _orderService.DeleteAsync(id);
            return NoContent();
        }
    }
}
