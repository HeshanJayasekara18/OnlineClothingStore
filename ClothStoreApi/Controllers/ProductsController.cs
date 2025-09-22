using Microsoft.AspNetCore.Mvc;
using ClothStoreApi.Models;
using ClothStoreApi.Data;
using Microsoft.EntityFrameworkCore;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly StoreContext _context;

        public ProductsController(StoreContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var products = await _context.Products.ToListAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products");
                return StatusCode(500, "An error occurred while retrieving products.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid product ID.");
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    return NotFound($"Product with ID {id} not found.");
                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product with ID {ProductId}", id);
                return StatusCode(500, "An error occurred while retrieving the product.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            try
            {

                if (product == null)
                    return BadRequest("Product data is null.");
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, "An error occurred while creating the product.");
            }

        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Product product)
        {
            try
            {
                if (id <= 0 || product == null || id != product.Id)
                    return BadRequest("Invalid product data.");
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                var existingProduct = await _context.Products.FindAsync(id);
                if (existingProduct == null)
                    return NotFound($"Product with ID {id} not found.");
                existingProduct.Name = product.Name;
                existingProduct.Description = product.Description;
                existingProduct.Price = product.Price;
                existingProduct.ImageUrl = product.ImageUrl;
                _context.Products.Update(existingProduct);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID {ProductId}", id);
                return StatusCode(500, "An error occurred while updating the product.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest("Invalid product ID.");
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    return NotFound($"Product with ID {id} not found.");
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product with ID {ProductId}", id);
                return StatusCode(500, "An error occurred while deleting the product.");
            }
        }

    }
}
