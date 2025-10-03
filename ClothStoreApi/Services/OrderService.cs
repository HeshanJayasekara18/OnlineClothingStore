using ClothStoreApi.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ClothStoreApi.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orders;

        public OrderService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            var collectionName = settings.Value.OrdersCollection;
            _orders = database.GetCollection<Order>(collectionName);
        }

        public async Task<List<Order>> GetAllAsync() => await _orders.Find(_ => true).ToListAsync();
        public async Task<Order?> GetByIdAsync(string id) => await _orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Order order) => await _orders.InsertOneAsync(order);
        public async Task UpdateAsync(string id, Order order) => await _orders.ReplaceOneAsync(o => o.Id == id, order);
        public async Task DeleteAsync(string id) => await _orders.DeleteOneAsync(o => o.Id == id);
    }
}
