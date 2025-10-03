namespace ClothStoreApi.Models
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public string CustomersCollection { get; set; } = "Customers";
        public string ProductsCollection { get; set; } = "Products";
        public string OrdersCollection { get; set; } = "Orders";
    }
}
