using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ClothStoreApi.Models;

namespace ClothStoreApi.Services
{
    public class CustomerService
    {
        private readonly IMongoCollection<Customer> _customers;

        public CustomerService(IMongoDatabase database, IOptions<MongoDbSettings> settings)
        {
            _customers = database.GetCollection<Customer>(settings.Value.CustomersCollection);
            
            // Create index on email for faster lookups
            var indexKeysDefinition = Builders<Customer>.IndexKeys.Ascending(c => c.Email);
            var indexOptions = new CreateIndexOptions { Unique = true };
            var indexModel = new CreateIndexModel<Customer>(indexKeysDefinition, indexOptions);
            _customers.Indexes.CreateOne(indexModel);
        }

        public async Task<List<Customer>> GetAllAsync() =>
            await _customers.Find(_ => true).ToListAsync();

        public async Task<Customer?> GetAsync(string id) =>
            await _customers.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<Customer?> GetByEmailAsync(string email) =>
            await _customers.Find(x => x.Email == email).FirstOrDefaultAsync();

        public async Task CreateAsync(Customer customer) =>
            await _customers.InsertOneAsync(customer);

        public async Task UpdateAsync(string id, Customer customer) =>
            await _customers.ReplaceOneAsync(x => x.Id == id, customer);

        public async Task DeleteAsync(string id) =>
            await _customers.DeleteOneAsync(x => x.Id == id);
    }
}