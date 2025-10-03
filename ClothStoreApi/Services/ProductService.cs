using ClothStoreApi.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;



namespace ClothStoreApi.Services
{
    public class ProductService
    {
        private readonly IMongoCollection<Product> _products;

        public ProductService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            var collectionName = settings.Value.ProductsCollection;
            _products = database.GetCollection<Product>(collectionName);
        }

        public async Task<List<Product>> GetAllAsync() => await _products.Find(_ => true).ToListAsync();
        public async Task<Product?> GetByIdAsync(string id) => await _products.Find(p => p.Id == id).FirstOrDefaultAsync();
        
        public async Task CreateAsync(Product product) => await _products.InsertOneAsync(product);
        public async Task UpdateAsync(string id, Product product) => await _products.ReplaceOneAsync(p => p.Id == id, product);
        public async Task DeleteAsync(string id) => await _products.DeleteOneAsync(p => p.Id == id);

        public async Task<List<Product>> GetByCategoryAndColorAsync(string category, string color)
        {
            var filter = Builders<Product>.Filter.And(
                Builders<Product>.Filter.Eq(p => p.Category, category),
                Builders<Product>.Filter.Eq(p => p.Color, color)
            );
            return await _products.Find(filter).ToListAsync();
        }
    }
}