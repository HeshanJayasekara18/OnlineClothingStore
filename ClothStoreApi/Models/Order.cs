namespace ClothStoreApi.Models
{
    public class Order
    {
        public string Id { get; set; } = null!;  // MongoDB string Id
        public string? CustomerId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
    }
}
