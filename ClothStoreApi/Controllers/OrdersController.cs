using Microsoft.AspNetCore.Mvc;
using ClothStoreApi.Models;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private static List<Order> orders = new List<Order>();

        [HttpGet]
        public IActionResult Get() => Ok(orders);

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var order = orders.FirstOrDefault(o => o.Id == id);
            return order != null ? Ok(order) : NotFound();
        }

        [HttpPost]
        public IActionResult Create(Order order)
        {
            order.Id = orders.Count > 0 ? orders.Max(o => o.Id) + 1 : 1;
            order.OrderDate = DateTime.UtcNow;
            orders.Add(order);
            return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var order = orders.FirstOrDefault(o => o.Id == id);
            if (order == null) return NotFound();

            orders.Remove(order);
            return NoContent();
        }
    }
}
