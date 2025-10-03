using Microsoft.AspNetCore.Mvc;
using ClothStoreApi.Models;
using ClothStoreApi.Services;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly ProductService _productService;

        public ProductsController(ProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        // GET all products
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var products = await _productService.GetAllAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products: {Message}", ex.Message);
#if DEBUG
                return StatusCode(500, $"Error retrieving products: {ex.Message}");
#else
                return StatusCode(500, "An error occurred while retrieving products.");
#endif
            }
        }

        // GET product by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                    return NotFound($"Product with ID {id} not found.");

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product with ID {ProductId}: {Message}", id, ex.Message);
#if DEBUG
                return StatusCode(500, $"Error retrieving product: {ex.Message}");
#else
                return StatusCode(500, "An error occurred while retrieving the product.");
#endif
            }
        }

        // CREATE product
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Product product)
        {
            try
            {
                if (product == null)
                    return BadRequest("Product data is null.");

                product.CreatedAt = DateTime.UtcNow;
                await _productService.CreateAsync(product);

                return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product: {Message}", ex.Message);
#if DEBUG
                return StatusCode(500, $"Error creating product: {ex.Message}");
#else
                return StatusCode(500, "An error occurred while creating the product.");
#endif
            }
        }

        // UPDATE product
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Product product)
        {
            try
            {
                var existingProduct = await _productService.GetByIdAsync(id);
                if (existingProduct == null)
                    return NotFound($"Product with ID {id} not found.");

                product.Id = id; // ensure ID stays the same
                await _productService.UpdateAsync(id, product);

                return Ok(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID {ProductId}: {Message}", id, ex.Message);
#if DEBUG
                return StatusCode(500, $"Error updating product: {ex.Message}");
#else
                return StatusCode(500, "An error occurred while updating the product.");
#endif
            }
        }

        // DELETE product
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var existingProduct = await _productService.GetByIdAsync(id);
                if (existingProduct == null)
                    return NotFound($"Product with ID {id} not found.");

                await _productService.DeleteAsync(id);

                return Ok(new { message = $"Product with ID {id} deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product with ID {ProductId}: {Message}", id, ex.Message);
#if DEBUG
                return StatusCode(500, $"Error deleting product: {ex.Message}");
#else
                return StatusCode(500, "An error occurred while deleting the product.");
#endif
            }
        }


        [HttpGet("match")]
        public async Task<IActionResult> MatchProducts([FromQuery] string category, [FromQuery] string color)
        {
            try
            {
                // Use ProductService to query MongoDB
                var matchedProducts = await _productService.GetByCategoryAndColorAsync(category, color);
                return Ok(matchedProducts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error matching products for category {Category} and color {Color}: {Message}", category, color, ex.Message);
        #if DEBUG
                return StatusCode(500, $"Error matching products: {ex.Message}");
        #else
                return StatusCode(500, "An error occurred while matching products.");
        #endif
            }
        }

                
                
    }
}
