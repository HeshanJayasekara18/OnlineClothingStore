using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ClothStoreApi.Models;
using ClothStoreApi.Services;
using System.Text;
using System.Text.Json;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StylistController : ControllerBase
    {
        private readonly GeminiSettings _geminiSettings;
        private readonly ProductService _productService;
        private readonly HttpClient _httpClient;

        public StylistController(
            IOptions<GeminiSettings> geminiSettings,
            ProductService productService,
            IHttpClientFactory httpClientFactory)
        {
            _geminiSettings = geminiSettings.Value;
            _productService = productService;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost("suggest")]
        public async Task<IActionResult> GetStyleSuggestion([FromBody] StyleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new { error = "Please provide a description of your situation" });
            }

            if (string.IsNullOrWhiteSpace(_geminiSettings.ApiKey))
            {
                return StatusCode(500, new { error = "Gemini API key not configured" });
            }

            try
            {
                // Build the prompt for Gemini
                var systemPrompt = @"You are a professional fashion stylist. Based on the user's situation, recommend appropriate clothing items. 
Be specific about:
- Type of clothing (e.g., dress, suit, casual wear)
- Colors that would work well
- Style suggestions
- Any accessories if relevant

Keep your response concise, friendly, and practical.";

                var userPrompt = $"User's situation: {request.Prompt}";

                // Call Gemini API
                var geminiResponse = await CallGeminiAPI(systemPrompt, userPrompt);

                return Ok(new
                {
                    suggestion = geminiResponse,
                    prompt = request.Prompt
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Gemini API: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get style suggestion", details = ex.Message });
            }
        }

        [HttpPost("suggest-with-products")]
        public async Task<IActionResult> GetStyleSuggestionWithProducts([FromBody] StyleRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new { error = "Please provide a description of your situation" });
            }

            try
            {
                // Get all products from store
                var allProducts = await _productService.GetAllAsync();

                // Build enhanced prompt with product catalog
                var productList = string.Join("\n", allProducts.Select(p => 
                    $"- {p.Name} ({p.Category}, {p.Color}, Size: {p.Size}, ${p.Price})"));

                var systemPrompt = @"You are a professional fashion stylist working for an online clothing store. 
Based on the user's situation and the available products in our store, recommend specific items.

Available Products:
" + productList + @"

Provide:
1. A brief style recommendation
2. Specific product names from the list above that match their needs
3. Why these items work for their situation

Keep it concise and helpful.";

                var userPrompt = $"User's situation: {request.Prompt}";

                var geminiResponse = await CallGeminiAPI(systemPrompt, userPrompt);

                return Ok(new
                {
                    suggestion = geminiResponse,
                    prompt = request.Prompt,
                    availableProducts = allProducts
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get suggestions", details = ex.Message });
            }
        }

        private async Task<string> CallGeminiAPI(string systemPrompt, string userPrompt)
        {
            var apiKey = _geminiSettings.ApiKey;
            
            // Try gemini-1.5-flash first (has higher rate limits)
            var models = new[] { "gemini-1.5-flash", "gemini-pro" };
            
            foreach (var model in models)
            {
                try
                {
                    var url = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

                    var requestBody = new
                    {
                        contents = new[]
                        {
                            new
                            {
                                parts = new[]
                                {
                                    new { text = systemPrompt + "\n\n" + userPrompt }
                                }
                            }
                        },
                        generationConfig = new
                        {
                            temperature = 0.7,
                            maxOutputTokens = 500
                        }
                    };

                    var jsonContent = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                    var response = await _httpClient.PostAsync(url, content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = await response.Content.ReadAsStringAsync();
                        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
                        
                        var result = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                        if (!string.IsNullOrEmpty(result))
                        {
                            return result;
                        }
                    }
                    else if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        // Rate limit hit, try next model
                        Console.WriteLine($"Rate limit hit for {model}, trying next model...");
                        continue;
                    }
                    else
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Error with {model}: {response.StatusCode} - {errorContent}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception with {model}: {ex.Message}");
                    continue;
                }
            }
            
            // If all models fail, return a helpful fallback message
            return GetFallbackSuggestion(userPrompt);
        }

        private string GetFallbackSuggestion(string userPrompt)
        {
            // Simple rule-based fallback when API is unavailable
            var prompt = userPrompt.ToLower();
            
            if (prompt.Contains("party") || prompt.Contains("celebration"))
            {
                return "For a party or celebration, I recommend:\n\n" +
                       "✨ Elegant Options:\n" +
                       "- A well-fitted dress shirt or blouse in a bold color\n" +
                       "- Dark jeans or dress pants\n" +
                       "- A blazer for a polished look\n" +
                       "- Comfortable dress shoes\n\n" +
                       "💡 Tip: Choose colors that make you feel confident. Dark colors like navy, black, or burgundy are always elegant choices.\n\n" +
                       "Note: AI suggestions are temporarily limited. Please check our store for available items!";
            }
            else if (prompt.Contains("office") || prompt.Contains("work") || prompt.Contains("professional"))
            {
                return "For professional office wear, I recommend:\n\n" +
                       "👔 Professional Essentials:\n" +
                       "- Crisp button-down shirt in white or light blue\n" +
                       "- Well-tailored pants or skirt\n" +
                       "- A blazer for important meetings\n" +
                       "- Professional shoes (loafers or heels)\n\n" +
                       "💡 Tip: Stick to neutral colors and classic cuts for a timeless professional look.\n\n" +
                       "Note: AI suggestions are temporarily limited. Please check our store for available items!";
            }
            else if (prompt.Contains("casual") || prompt.Contains("coffee") || prompt.Contains("date"))
            {
                return "For a casual outing, I recommend:\n\n" +
                       "☕ Casual Chic:\n" +
                       "- A comfortable t-shirt or casual top\n" +
                       "- Well-fitted jeans or chinos\n" +
                       "- Sneakers or casual shoes\n" +
                       "- A light jacket if needed\n\n" +
                       "💡 Tip: Choose colors that complement your style. Blues, grays, and earth tones work well for casual wear.\n\n" +
                       "Note: AI suggestions are temporarily limited. Please check our store for available items!";
            }
            else
            {
                return "Based on your needs, here are some general style tips:\n\n" +
                       "🎨 Style Essentials:\n" +
                       "- Choose clothing that fits well and makes you comfortable\n" +
                       "- Consider the occasion and dress code\n" +
                       "- Pick colors that complement your skin tone\n" +
                       "- Accessorize to complete your look\n\n" +
                       "💡 Tip: Browse our store to find items that match your size and style preferences!\n\n" +
                       "Note: AI suggestions are temporarily limited due to high demand. Please try again in a few minutes or check our store directly!";
            }
        }
    }

    // Request/Response models
    public class StyleRequest
    {
        public string Prompt { get; set; } = string.Empty;
    }

    public class GeminiResponse
    {
        public List<Candidate>? Candidates { get; set; }
    }

    public class Candidate
    {
        public Content? Content { get; set; }
    }

    public class Content
    {
        public List<Part>? Parts { get; set; }
    }

    public class Part
    {
        public string? Text { get; set; }
    }
}
