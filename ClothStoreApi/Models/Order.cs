using System.ComponentModel.DataAnnotations;

namespace ClothStoreApi.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }  // SQL/EF Core PK for orders

        // Reference to MongoDB Customer (string Id)
        public string? CustomerId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }

        // You can expand this later (list of items, status, etc.)
    }
}
