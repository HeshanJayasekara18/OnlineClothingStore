namespace ClothStoreApi.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public List<int> ProductIds { get; set; } = new List<int>();
        public decimal TotalAmount { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;


        
        public Customer? Customer { get; set; } // Navigation property
    }
}
