using ClothStoreApi.Models;
using MongoDB.Driver;

namespace ClothStoreApi.Services
{
    public class CustomerService
    {
        private readonly IMongoCollection<Customer> _customers;

        public CustomerService(IConfiguration config)
        {
            var mongoClient = new MongoClient(config["MongoDbSettings:ConnectionString"]);
            var mongoDatabase = mongoClient.GetDatabase(config["MongoDbSettings:DatabaseName"]);
            _customers = mongoDatabase.GetCollection<Customer>(config["MongoDbSettings:CustomersCollection"]);
        }

        public async Task<List<Customer>> GetAsync() =>
            await _customers.Find(_ => true).ToListAsync();

        public async Task<Customer?> GetAsync(string id) =>
            await _customers.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<Customer?> GetByEmailAsync(string email) =>
            await _customers.Find(x => x.Email == email).FirstOrDefaultAsync();

        public async Task CreateAsync(Customer customer) =>
            await _customers.InsertOneAsync(customer);
    }
}
