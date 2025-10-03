using ClothStoreApi.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace ClothStoreApi.Services
{
    public class CustomerService
    {
        private readonly IMongoCollection<Customer> _customers;

        public CustomerService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            var collectionName = settings.Value.CustomersCollection;
            _customers = database.GetCollection<Customer>(collectionName);
        }

        public async Task<List<Customer>> GetAsync() => await _customers.Find(_ => true).ToListAsync();
        public async Task<List<Customer>> GetAllAsync() => await _customers.Find(_ => true).ToListAsync();
        public async Task<Customer?> GetAsync(string id) => await _customers.Find(c => c.Id == id).FirstOrDefaultAsync();
        public async Task<Customer?> GetByEmailAsync(string email) => await _customers.Find(c => c.Email == email).FirstOrDefaultAsync();
        public async Task CreateAsync(Customer customer) => await _customers.InsertOneAsync(customer);
    }
}