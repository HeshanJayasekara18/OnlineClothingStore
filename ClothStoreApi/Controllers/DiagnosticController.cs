using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ClothStoreApi.Models;
using System.Text.Json;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiagnosticController : ControllerBase
    {
        private readonly GeminiSettings _geminiSettings;
        private readonly HttpClient _httpClient;

        public DiagnosticController(
            IOptions<GeminiSettings> geminiSettings,
            IHttpClientFactory httpClientFactory)
        {
            _geminiSettings = geminiSettings.Value;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpGet("list-models")]
        public async Task<IActionResult> ListAvailableModels()
        {
            try
            {
                var apiKey = _geminiSettings.ApiKey;
                
                // Try v1 API
                var urlV1 = $"https://generativelanguage.googleapis.com/v1/models?key={apiKey}";
                var responseV1 = await _httpClient.GetAsync(urlV1);
                var contentV1 = await responseV1.Content.ReadAsStringAsync();
                
                Console.WriteLine("=== V1 API Response ===");
                Console.WriteLine(contentV1);
                
                // Try v1beta API
                var urlV1Beta = $"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}";
                var responseV1Beta = await _httpClient.GetAsync(urlV1Beta);
                var contentV1Beta = await responseV1Beta.Content.ReadAsStringAsync();
                
                Console.WriteLine("\n=== V1Beta API Response ===");
                Console.WriteLine(contentV1Beta);

                return Ok(new
                {
                    v1Api = JsonSerializer.Deserialize<object>(contentV1),
                    v1BetaApi = JsonSerializer.Deserialize<object>(contentV1Beta)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}