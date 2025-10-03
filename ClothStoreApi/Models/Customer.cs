using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ClothStoreApi.Models
{
    public class Customer
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public string? Phone { get; set; }

        public string? Picture { get; set; }
    }
}