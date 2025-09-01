using Microsoft.AspNetCore.Mvc;
using ClothStoreApi.Models;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private static List<Customer> customers = new List<Customer>();

        [HttpGet]
        public IActionResult Get() => Ok(customers);

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var customer = customers.FirstOrDefault(c => c.Id == id);
            return customer != null ? Ok(customer) : NotFound();
        }

        [HttpPost]
        public IActionResult Create(Customer customer)
        {
            customer.Id = customers.Count > 0 ? customers.Max(c => c.Id) + 1 : 1;
            customers.Add(customer);
            return CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Customer updatedCustomer)
        {
            var customer = customers.FirstOrDefault(c => c.Id == id);
            if (customer == null) return NotFound();

            customer.FullName = updatedCustomer.FullName;
            customer.Email = updatedCustomer.Email;
            customer.Phone = updatedCustomer.Phone;

            return Ok(customer);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var customer = customers.FirstOrDefault(c => c.Id == id);
            if (customer == null) return NotFound();

            customers.Remove(customer);
            return NoContent();
        }
    }
}
