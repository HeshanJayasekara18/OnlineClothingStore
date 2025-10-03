using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ClothStoreApi.Models
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Color { get; set; } = null!;
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}