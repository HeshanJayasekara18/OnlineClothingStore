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
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                _logger.LogInformation("Retrieving all products");
                var products = await _productService.GetAllAsync();
                _logger.LogInformation("Successfully retrieved {Count} products", products.Count);

                return Ok(new
                {
                    success = true,
                    count = products.Count,
                    data = products
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products: {Message}", ex.Message);

                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while retrieving products.",
                    details = ex.Message
                });
            }
        }

        // GET product by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { success = false, error = "Product ID is required." });

                _logger.LogInformation("Retrieving product with ID: {ProductId}", id);
                var product = await _productService.GetByIdAsync(id);
                if (product == null)
                {
                    _logger.LogWarning("Product with ID {ProductId} not found", id);
                    return NotFound(new { success = false, error = $"Product with ID {id} not found." });
                }

                return Ok(new { success = true, data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product with ID {ProductId}: {Message}", id, ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while retrieving the product.",
                    details = ex.Message
                });
            }
        }

        // CREATE product
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            try
            {
                if (product == null)
                    return BadRequest(new { success = false, error = "Product data is required." });

                // Validate required fields
                if (string.IsNullOrWhiteSpace(product.Name))
                    return BadRequest(new { success = false, error = "Product name is required." });

                if (string.IsNullOrWhiteSpace(product.Category))
                    return BadRequest(new { success = false, error = "Product category is required." });

                if (product.Price <= 0)
                    return BadRequest(new { success = false, error = "Product price must be greater than 0." });

                _logger.LogInformation("Creating new product: {ProductName}", product.Name);
                product.CreatedAt = DateTime.UtcNow;
                await _productService.CreateAsync(product);

                _logger.LogInformation("Product created successfully with ID: {ProductId}", product.Id);
                return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, new
                {
                    success = true,
                    message = "Product created successfully.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product: {Message}", ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while creating the product.",
                    details = ex.Message
                });
            }
        }

        // UPDATE product
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(string id, [FromBody] Product product)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { success = false, error = "Product ID is required." });

                if (product == null)
                    return BadRequest(new { success = false, error = "Product data is required." });

                _logger.LogInformation("Updating product with ID: {ProductId}", id);
                var existingProduct = await _productService.GetByIdAsync(id);
                if (existingProduct == null)
                {
                    _logger.LogWarning("Product with ID {ProductId} not found for update", id);
                    return NotFound(new { success = false, error = $"Product with ID {id} not found." });
                }

                product.Id = id; // ensure ID stays the same
                await _productService.UpdateAsync(id, product);

                _logger.LogInformation("Product with ID {ProductId} updated successfully", id);
                return Ok(new
                {
                    success = true,
                    message = "Product updated successfully.",
                    data = product
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product with ID {ProductId}: {Message}", id, ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while updating the product.",
                    details = ex.Message
                });
            }
        }

        // DELETE product
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new { success = false, error = "Product ID is required." });

                _logger.LogInformation("Deleting product with ID: {ProductId}", id);
                var existingProduct = await _productService.GetByIdAsync(id);
                if (existingProduct == null)
                {
                    _logger.LogWarning("Product with ID {ProductId} not found for deletion", id);
                    return NotFound(new { success = false, error = $"Product with ID {id} not found." });
                }

                await _productService.DeleteAsync(id);

                _logger.LogInformation("Product with ID {ProductId} deleted successfully", id);
                return Ok(new
                {
                    success = true,
                    message = $"Product with ID {id} deleted successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product with ID {ProductId}: {Message}", id, ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while deleting the product.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("match")]
        public async Task<IActionResult> MatchProducts([FromQuery] string category, [FromQuery] string color)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category) && string.IsNullOrWhiteSpace(color))
                    return BadRequest(new { success = false, error = "At least one filter (category or color) is required." });

                _logger.LogInformation("Matching products for category: {Category}, color: {Color}", category, color);
                var matchedProducts = await _productService.GetByCategoryAndColorAsync(category, color);
                _logger.LogInformation("Found {Count} matching products", matchedProducts.Count);

                return Ok(new
                {
                    success = true,
                    count = matchedProducts.Count,
                    data = matchedProducts
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error matching products for category {Category} and color {Color}: {Message}", category, color, ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while matching products.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                _logger.LogInformation("Retrieving all categories");
                var categories = await _productService.GetCategoriesAsync();
                return Ok(new
                {
                    success = true,
                    count = categories.Count,
                    data = categories
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories: {Message}", ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while retrieving categories.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(category))
                    return BadRequest(new { success = false, error = "Category is required." });

                _logger.LogInformation("Retrieving products for category: {Category}", category);
                var products = await _productService.GetByCategoryAsync(category);

                return Ok(new
                {
                    success = true,
                    count = products.Count,
                    data = products
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving products for category {Category}: {Message}", category, ex.Message);
                return StatusCode(500, new
                {
                    success = false,
                    error = "An error occurred while retrieving products.",
                    details = ex.Message
                });
            }
        }
        
        [HttpGet("diagnostics")]
public async Task<IActionResult> GetDiagnostics()
{
    try
    {
        _logger.LogInformation("Running diagnostics");
        
        // Test basic connectivity
        var products = await _productService.GetAllAsync();
        
        return Ok(new
        {
            success = true,
            message = "Diagnostics completed successfully",
            productsCount = products.Count,
            sampleProduct = products.FirstOrDefault(),
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Diagnostics failed");
        return StatusCode(500, new
        {
            success = false,
            error = "Diagnostics failed",
            message = ex.Message,
            innerException = ex.InnerException?.Message,
            timestamp = DateTime.UtcNow
        });
    }
}
    }
}