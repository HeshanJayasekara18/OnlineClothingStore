using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ClothStoreApi.Models
{
    [BsonIgnoreExtraElements] // This ignores any extra fields in MongoDB
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string Name { get; set; } = null!;
        public string Category { get; set; } = null!;
        public string Color { get; set; } = null!;
        public decimal Price { get; set; }
        
        // Add the missing Description field that exists in your database
        public string Description { get; set; } = string.Empty;
        
        // Add other common fields that might exist
        public string Size { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public List<string> ImageUrls { get; set; } = new();
        public int StockQuantity { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}