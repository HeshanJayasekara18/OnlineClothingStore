using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ClothStoreApi.Models
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        
        public string CustomerId { get; set; } = null!;
        public List<OrderItem> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "Pending";
        public ShippingAddress ShippingAddress { get; set; } = null!;
    }

    public class OrderItem
    {
        public string ProductId { get; set; } = null!;
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }

    public class ShippingAddress
    {
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string ZipCode { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}