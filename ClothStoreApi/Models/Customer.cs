using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ClothStoreApi.Models
{
    public class Customer
    {
        [BsonId] // MongoDB primary key
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // for login
    }
}
