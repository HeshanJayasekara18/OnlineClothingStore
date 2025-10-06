using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Bson;
using ClothStoreApi.Models;

namespace ClothStoreApi.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _products;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IMongoDatabase database, IOptions<MongoDbSettings> settings, ILogger<ProductService> logger)
        {
            _products = database.GetCollection<Product>(settings.Value.ProductsCollection);
            _logger = logger;
        }

        public async Task<List<Product>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Fetching all products from MongoDB");
                var products = await _products.Find(_ => true).ToListAsync();
                _logger.LogInformation("Successfully retrieved {Count} products", products.Count);
                return products;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all products from MongoDB");
                throw;
            }
        }

        public async Task<Product?> GetByIdAsync(string id)
        {
            try
            {
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                return await _products.Find(filter).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product by ID: {ProductId}", id);
                throw;
            }
        }

        public async Task CreateAsync(Product product)
        {
            try
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;
                await _products.InsertOneAsync(product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product: {ProductName}", product.Name);
                throw;
            }
        }

        public async Task UpdateAsync(string id, Product product)
        {
            try
            {
                product.UpdatedAt = DateTime.UtcNow;
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                await _products.ReplaceOneAsync(filter, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product: {ProductId}", id);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                var filter = Builders<Product>.Filter.Eq(p => p.Id, id);
                await _products.DeleteOneAsync(filter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product: {ProductId}", id);
                throw;
            }
        }

        public async Task<List<Product>> GetByCategoryAndColorAsync(string category, string color)
        {
            try
            {
                var filter = Builders<Product>.Filter.And(
                    Builders<Product>.Filter.Eq(p => p.Category, category),
                    Builders<Product>.Filter.Eq(p => p.Color, color)
                );
                return await _products.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products by category and color: {Category}, {Color}", category, color);
                throw;
            }
        }

        public async Task<List<Product>> GetByCategoryAsync(string category)
        {
            try
            {
                var filter = Builders<Product>.Filter.Eq(p => p.Category, category);
                return await _products.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting products by category: {Category}", category);
                throw;
            }
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            try
            {
                return await _products.Distinct<string>("Category", FilterDefinition<Product>.Empty).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                throw;
            }
        }

        // Method to check collection schema
        public async Task<BsonDocument> GetCollectionSchemaAsync()
        {
            try
            {
                var sampleDocument = await _products.Find(_ => true).FirstOrDefaultAsync();
                if (sampleDocument != null)
                {
                    // Convert to BSON to see actual fields
                    var bsonDocument = sampleDocument.ToBsonDocument();
                    _logger.LogInformation("Collection schema sample: {Schema}", bsonDocument.ToString());
                    return bsonDocument;
                }
                return new BsonDocument();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting collection schema");
                throw;
            }
        }
    }
}