using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ClothStoreApi.Models;

namespace ClothStoreApi.Services
{
    public class OrderService
    {
        private readonly IMongoCollection<Order> _orders;

        public OrderService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _orders = database.GetCollection<Order>(settings.Value.OrdersCollection);
        }

        public async Task<List<Order>> GetAllAsync() =>
            await _orders.Find(_ => true).ToListAsync();

        public async Task<Order?> GetByIdAsync(string id) =>
            await _orders.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<List<Order>> GetByCustomerIdAsync(string customerId) =>
            await _orders.Find(x => x.CustomerId == customerId).ToListAsync();

        public async Task CreateAsync(Order order)
        {
            order.OrderDate = DateTime.UtcNow;
            await _orders.InsertOneAsync(order);
        }

        public async Task UpdateAsync(string id, Order order) =>
            await _orders.ReplaceOneAsync(x => x.Id == id, order);

        public async Task DeleteAsync(string id) =>
            await _orders.DeleteOneAsync(x => x.Id == id);

        public async Task UpdateStatusAsync(string id, string status)
        {
            var update = Builders<Order>.Update.Set(o => o.Status, status);
            await _orders.UpdateOneAsync(x => x.Id == id, update);
        }
    }
}