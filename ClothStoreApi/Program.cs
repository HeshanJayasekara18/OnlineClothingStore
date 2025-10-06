using ClothStoreApi.Models;
using ClothStoreApi.Services;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Kestrel Configuration --------------------
bool isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER")?.ToLower() == "true";

if (isDocker)
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(80);   // HTTP inside container
        options.ListenAnyIP(8080); // Optional extra port if needed
    });
}

// -------------------- Configuration --------------------
builder.Configuration
       .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
       .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)
       .AddEnvironmentVariables();

// -------------------- Services --------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithExposedHeaders("Location");
    });
});

// -------------------- MongoDB --------------------
// Support both appsettings.json and environment variables
var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") 
    ?? builder.Configuration["MongoDbSettings:ConnectionString"];
var mongoDatabaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME") 
    ?? builder.Configuration["MongoDbSettings:DatabaseName"];

if (string.IsNullOrEmpty(mongoConnectionString))
    throw new InvalidOperationException("MongoDB ConnectionString is not configured. Set MONGODB_CONNECTION_STRING environment variable or MongoDbSettings:ConnectionString in appsettings.json");

builder.Services.Configure<MongoDbSettings>(options =>
{
    options.ConnectionString = mongoConnectionString;
    options.DatabaseName = mongoDatabaseName ?? "ClothStoreDb";
});

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    Console.WriteLine($"Connecting to MongoDB database: {settings.DatabaseName}");
    return new MongoClient(settings.ConnectionString);
});

builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return client.GetDatabase(settings.DatabaseName);
});

// -------------------- Application Services --------------------
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CustomerService>();

// -------------------- Authentication --------------------
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    options.CallbackPath = "/signin-google";
});

var app = builder.Build();

// -------------------- Middleware --------------------
if (app.Environment.IsDevelopment())
{
    
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ClothStore API V1");
    });

}

// Avoid redirecting CORS preflight (OPTIONS) in development
// Only force HTTPS redirection in Production or when running behind a proxy that terminates TLS
if (!isDocker && app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

// CORS must be placed between UseRouting and UseAuthorization
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// -------------------- Health & Test Endpoints --------------------
app.MapGet("/", () =>
{
    return Results.Json(new
    {
        message = "ClothStore API is running!",
        status = "Healthy",
        timestamp = DateTime.UtcNow,
        environment = app.Environment.EnvironmentName,
        os = System.Runtime.InteropServices.RuntimeInformation.OSDescription
    });
});

app.MapGet("/health", () => "Healthy");
app.MapGet("/test", () => "Test endpoint is working!");

// MongoDB test endpoint
app.MapGet("/test-mongodb", async (IMongoClient mongoClient, IConfiguration configuration) =>
{
    try
    {
        var databaseName = configuration["MongoDbSettings:DatabaseName"];
        var database = mongoClient.GetDatabase(databaseName);
        await database.RunCommandAsync<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));

        return Results.Ok(new { status = "MongoDB connected successfully", database = databaseName });
    }
    catch (Exception ex)
    {
        return Results.Problem($"MongoDB connection failed: {ex.Message}");
    }
});

Console.WriteLine($"Application starting {(isDocker ? "in Docker/Azure" : "locally")}...");
app.Run();
