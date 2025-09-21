using ClothStoreApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();   
builder.Services.AddSwaggerGen();             

builder.Services.AddDbContext<StoreContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Swagger should be enabled in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();                        
    app.UseSwaggerUI();                       
}

app.UseAuthorization();
app.MapControllers();
app.Run();
