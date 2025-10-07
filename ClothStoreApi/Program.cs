using ClothStoreApi.Models;
using ClothStoreApi.Services;
using MongoDB.Driver;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Kestrel Configuration for Docker --------------------
bool isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER")?.ToLower() == "true";
var port = Environment.GetEnvironmentVariable("PORT") ?? "80"; // Azure automatically sets this

if (isDocker)
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(80);
        options.ListenAnyIP(8080); // optional
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
        policy.SetIsOriginAllowed(origin =>
              {
                  // Allow localhost for development
                  if (origin.StartsWith("http://localhost:") || origin.StartsWith("https://localhost:"))
                      return true;
                  
                  // Allow all Vercel deployments
                  if (origin.EndsWith(".vercel.app"))
                      return true;
                  
                  return false;
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("Location");
    });
});

// -------------------- MongoDB --------------------
var mongoConnectionString = Environment.GetEnvironmentVariable("MongoDbSettings__ConnectionString") 
    ?? builder.Configuration["MongoDbSettings:ConnectionString"];
var mongoDatabaseName = Environment.GetEnvironmentVariable("MongoDbSettings__DatabaseName") 
    ?? builder.Configuration["MongoDbSettings:DatabaseName"] 
    ?? "ClothStoreDb";

if (string.IsNullOrEmpty(mongoConnectionString))
    throw new InvalidOperationException("MongoDB ConnectionString is not configured.");

builder.Services.Configure<MongoDbSettings>(options =>
{
    options.ConnectionString = mongoConnectionString;
    options.DatabaseName = mongoDatabaseName;
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
var googleClientId = Environment.GetEnvironmentVariable("Authentication__Google__ClientId") 
                     ?? builder.Configuration["Authentication:Google:ClientId"];
var googleClientSecret = Environment.GetEnvironmentVariable("Authentication__Google__ClientSecret") 
                         ?? builder.Configuration["Authentication:Google:ClientSecret"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
{
    if (string.IsNullOrEmpty(googleClientId) || string.IsNullOrEmpty(googleClientSecret))
        Console.WriteLine("Warning: Google OAuth ClientId or ClientSecret is missing!");

    options.ClientId = googleClientId;
    options.ClientSecret = googleClientSecret;
    options.CallbackPath = "/signin-google";
});

// -------------------- OpenAI & Gemini Settings --------------------
builder.Services.Configure<OpenAISettings>(builder.Configuration.GetSection("OpenAI"));
builder.Services.Configure<GeminiSettings>(builder.Configuration.GetSection("Gemini"));

// -------------------- Build App --------------------
var app = builder.Build();

// -------------------- Middleware --------------------
// Enable Swagger in all environments (including Production for Azure)
app.UseSwagger();
app.UseSwaggerUI(c => 
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ClothStore API V1");
    c.RoutePrefix = "swagger"; // Access at /swagger
});

if (!isDocker && app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// -------------------- Health & Test Endpoints --------------------
app.MapGet("/", () => Results.Json(new
{
    message = "ClothStore API is running!",
    status = "Healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    os = System.Runtime.InteropServices.RuntimeInformation.OSDescription
}));

app.MapGet("/health", () => "Healthy");
app.MapGet("/test", () => "Test endpoint is working!");

// MongoDB test endpoint
app.MapGet("/test-mongodb", async (IMongoClient mongoClient) =>
{
    try
    {
        var database = mongoClient.GetDatabase(mongoDatabaseName);
        await database.RunCommandAsync<MongoDB.Bson.BsonDocument>(new MongoDB.Bson.BsonDocument("ping", 1));
        return Results.Ok(new { status = "MongoDB connected successfully", database = mongoDatabaseName });
    }
    catch (Exception ex)
    {
        return Results.Problem($"MongoDB connection failed: {ex.Message}");
    }
});

Console.WriteLine($"Application starting {(isDocker ? "in Docker/Azure" : "locally")}...");
app.Run();
