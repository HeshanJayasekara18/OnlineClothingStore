using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace ClothStoreApi.Models
{
    [BsonIgnoreExtraElements]                // <-- add this
    public class Customer
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("Email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("FirstName")]
        [BsonIgnoreIfNull]
        public string? FirstName { get; set; }

        [BsonElement("LastName")]
        [BsonIgnoreIfNull]
        public string? LastName { get; set; }

        [BsonElement("Name")]
        [BsonIgnoreIfNull]
        public string? Name { get; set; }

        [BsonIgnore]
        public string? Password { get; set; }

        [BsonElement("PasswordHash")]
        [BsonIgnoreIfNull]
        public string? PasswordHash { get; set; }

        [BsonElement("Picture")]
        [BsonIgnoreIfNull]
        public string? Picture { get; set; }

        [BsonElement("Role")]
        [BsonIgnoreIfNull]
        public string Role { get; set; } = "User";

        [BsonElement("ResetCode")]
        [BsonIgnoreIfNull]
        public string? ResetCode { get; set; }

        [BsonElement("ResetCodeExpiry")]
        [BsonIgnoreIfNull]
        public DateTime? ResetCodeExpiry { get; set; }

        [BsonElement("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}