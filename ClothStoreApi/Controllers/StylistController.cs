using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ClothStoreApi.Models;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ClothStoreApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StylistController : ControllerBase
    {
        private readonly GeminiSettings _geminiSettings;
        private readonly HttpClient _httpClient;
        private const string StylistSystemPrompt = @"You are ClothStore's AI fashion stylist.

Follow this structure in Markdown:
1. Start with a warm one-line acknowledgement that references the occasion if mentioned.
2. Provide a short "Outfit snapshot" sentence summarizing the overall look.
3. Present bullet-point sections titled **Tops**, **Bottoms**, **Footwear**, and **Accessories** (omit a section only if it truly has no recommendations). Include color palettes and fabric guidance.
4. Add a **Fit & Comfort Tips** section that uses the user's size or body clues. If size information is missing, politely ask for it here.
5. Add a **Budget Pointers** section if any budget context is available; otherwise give a general smart-shopping tip.
6. Finish with a friendly call-to-action inviting follow-up questions or adjustments.

Always keep the tone encouraging, modern, and practical. Avoid repeating the user's words verbatim, and tailor suggestions to their cues.";

        public StylistController(
            IOptions<GeminiSettings> geminiSettings,
            IHttpClientFactory httpClientFactory)
        {
            _geminiSettings = geminiSettings.Value;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("AspNetCoreGeminiStylist/1.0");
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (request?.Messages == null || request.Messages.Count == 0)
            {
                return BadRequest(new { error = "Please include at least one chat message." });
            }

            if (string.IsNullOrWhiteSpace(_geminiSettings.ApiKey))
            {
                return StatusCode(500, new { error = "Gemini API key not configured" });
            }

            var sanitizedMessages = request.Messages
                .Where(m => m != null && !string.IsNullOrWhiteSpace(m.Content))
                .Select(m => new ChatMessage
                {
                    Role = NormalizeRole(m.Role),
                    Content = m.Content.Trim()
                })
                .ToList();

            if (sanitizedMessages.Count == 0)
            {
                return BadRequest(new { error = "Messages cannot be empty." });
            }

            try
            {
                var reply = await CallGeminiChatAsync(sanitizedMessages);
                return Ok(new ChatResponse { Message = reply });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Gemini API: {ex.Message}");
                return StatusCode(500, new { error = "Failed to get style suggestion", details = ex.Message });
            }
        }

        private static string NormalizeRole(string? role)
        {
            if (string.IsNullOrWhiteSpace(role))
            {
                return "user";
            }

            var normalized = role.Trim().ToLowerInvariant();
            return normalized switch
            {
                "assistant" => "model",
                "model" => "model",
                _ => "user"
            };
        }

        private async Task<string> CallGeminiChatAsync(List<ChatMessage> messages)
        {
            var apiKey = _geminiSettings.ApiKey;
            
            // FIX: Updated to use current, stable model alias: gemini-2.5-flash
            var modelsToTry = new[]
            {
                ("gemini-2.5-flash", "v1beta"), // Best practice, modern, and cheap model
                ("gemini-2.5-pro", "v1beta"),   // More capable, but more expensive model
                ("gemini-2.0-flash", "v1beta")  // Older stable model, good fallback
            };

            foreach (var (model, apiVersion) in modelsToTry)
            {
                try
                {
                    Console.WriteLine($"Attempting to call Gemini API with model: {model}");
                    var result = await TryCallGeminiModel(apiKey, model, apiVersion, messages);
                    
                    if (!string.IsNullOrEmpty(result))
                    {
                        Console.WriteLine($"✓ Successfully got response from {model}");
                        return result;
                    }
                }
                // NOTE: We catch Exception here to allow the loop to continue to the next model
                catch (Exception ex) 
                {
                    // This will catch the 404 error and log it, allowing the next model to be attempted.
                    Console.WriteLine($"✗ Failed with {model}: {ex.Message}");
                }
            }

            // If all models fail, use intelligent fallback
            Console.WriteLine("All Gemini models failed, using intelligent fallback response");
            return GenerateIntelligentFallback(messages);
        }

        private async Task<string?> TryCallGeminiModel(
            string apiKey, 
            string model, 
            string apiVersion, 
            List<ChatMessage> messages)
        {
            var baseUrl = $"https://generativelanguage.googleapis.com/{apiVersion}/models/{model}:generateContent";
            var url = $"{baseUrl}?key={apiKey}";

            var conversation = new List<object>
            {
                new
                {
                    role = "user",
                    parts = new[] { new { text = StylistSystemPrompt } }
                },
                new
                {
                    role = "model",
                    parts = new[] { new { text = "Understood. I'll provide fashion styling advice based on your needs." } }
                }
            };

            conversation.AddRange(messages.Select(message => new
            {
                role = message.Role,
                parts = new[] { new { text = message.Content } }
            }));

            var requestBody = new
            {
                contents = conversation,
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 500,
                    topP = 0.95,
                    topK = 40
                }
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(url, content);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                
                try
                {
                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent, new JsonSerializerOptions 
                    { 
                        PropertyNameCaseInsensitive = true 
                    });
                    
                    var result = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;
                    
                    if (!string.IsNullOrEmpty(result))
                    {
                        return result;
                    }
                }
                catch (JsonException jsonEx)
                {
                    Console.WriteLine($"JSON Deserialization Error: {jsonEx.Message}");
                }
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"HTTP {response.StatusCode}: {errorContent}");
                
                // Re-throw a specific error for better logging/debugging in the main loop
                throw new HttpRequestException($"Gemini API call failed with status {response.StatusCode}. Response: {errorContent}");
            }

            return null;
        }

        private string GenerateIntelligentFallback(List<ChatMessage> messages)
        {
            // ... (Fallback logic remains the same for simplicity)
            var lastUserMessage = messages.LastOrDefault(m => m.Role == "user")?.Content?.ToLowerInvariant() ?? "";
            
            // Extract key information from the message
            string size = ExtractSize(lastUserMessage);
            string gender = ExtractGender(lastUserMessage);
            string occasion = ExtractOccasion(lastUserMessage);
            string colors = ExtractColors(lastUserMessage);
            string budget = ExtractBudget(lastUserMessage);

            // Build personalized response
            var response = new StringBuilder();
            response.AppendLine($"Great! Let me help you find the perfect outfit for {occasion}.\n");

            if (occasion.Contains("party") || occasion.Contains("celebration") || occasion.Contains("birthday"))
            {
                response.AppendLine("🎉 **Party Outfit Suggestions:**\n");
                if (gender.Contains("women") || gender.Contains("female") || (!gender.Contains("men") && !gender.Contains("male")))
                {
                    response.AppendLine($"• **Dress**: A midi or cocktail dress in {(string.IsNullOrEmpty(colors) ? "jewel tones (emerald, sapphire, burgundy)" : colors)}");
                    response.AppendLine("• **Top & Bottom**: Silk blouse with high-waisted trousers or a stylish skirt");
                    response.AppendLine("• **Shoes**: Heeled sandals or pumps (3-4 inch heel)");
                    response.AppendLine("• **Accessories**: Statement earrings, clutch bag, delicate bracelet");
                }
                else
                {
                    response.AppendLine($"• **Blazer**: Well-fitted blazer in {(string.IsNullOrEmpty(colors) ? "navy, charcoal, or black" : colors)}");
                    response.AppendLine("• **Pants**: Dress pants or chinos (avoid jeans unless very upscale)");
                    response.AppendLine("• **Shirt**: Crisp button-down or polo in complementary color");
                    response.AppendLine("• **Shoes**: Leather dress shoes or loafers");
                    response.AppendLine("• **Accessories**: Watch, leather belt");
                }
            }
            else if (occasion.Contains("office") || occasion.Contains("work") || occasion.Contains("professional") || occasion.Contains("interview"))
            {
                response.AppendLine("💼 **Professional Office Wear:**\n");
                if (gender.Contains("women") || gender.Contains("female") || (!gender.Contains("men") && !gender.Contains("male")))
                {
                    response.AppendLine("• **Suit/Blazer**: Tailored blazer in navy, black, or gray");
                    response.AppendLine("• **Bottom**: Pencil skirt, dress pants, or tailored trousers");
                    response.AppendLine("• **Top**: Silk or cotton blouse in white, cream, or pastel");
                    response.AppendLine("• **Shoes**: Closed-toe pumps or loafers (2-3 inch heel)");
                    response.AppendLine("• **Accessories**: Minimal jewelry, structured handbag");
                }
                else
                {
                    response.AppendLine("• **Suit**: Two-piece suit in navy, charcoal, or black");
                    response.AppendLine("• **Shirt**: White or light blue dress shirt");
                    response.AppendLine("• **Tie**: Conservative pattern or solid color");
                    response.AppendLine("• **Shoes**: Oxford or derby shoes (black or brown)");
                    response.AppendLine("• **Accessories**: Leather belt, professional watch");
                }
            }
            else if (occasion.Contains("casual") || occasion.Contains("coffee") || occasion.Contains("date") || occasion.Contains("weekend"))
            {
                response.AppendLine("☕ **Casual Chic Outfit:**\n");
                if (gender.Contains("women") || gender.Contains("female") || (!gender.Contains("men") && !gender.Contains("male")))
                {
                    response.AppendLine($"• **Jeans**: Well-fitted dark or {(string.IsNullOrEmpty(colors) ? "medium wash" : colors)} jeans");
                    response.AppendLine("• **Top**: Stylish blouse, fitted t-shirt, or sweater");
                    response.AppendLine("• **Shoes**: White sneakers, ankle boots, or loafers");
                    response.AppendLine("• **Outerwear**: Denim jacket, leather jacket, or cardigan");
                    response.AppendLine("• **Accessories**: Crossbody bag, simple necklace, sunglasses");
                }
                else
                {
                    response.AppendLine($"• **Pants**: Chinos or dark jeans in {(string.IsNullOrEmpty(colors) ? "navy, khaki, or gray" : colors)}");
                    response.AppendLine("• **Shirt**: Casual button-up, polo, or henley");
                    response.AppendLine("• **Shoes**: Clean sneakers, loafers, or desert boots");
                    response.AppendLine("• **Outerwear**: Bomber jacket, denim jacket, or cardigan");
                    response.AppendLine("• **Accessories**: Watch, simple belt");
                }
            }
            else if (occasion.Contains("beach") || occasion.Contains("vacation") || occasion.Contains("summer") || occasion.Contains("tropical"))
            {
                response.AppendLine("🏖️ **Beach/Vacation Style:**\n");
                response.AppendLine("• **Swimwear**: Quality swimsuit or trunks");
                response.AppendLine("• **Cover-ups**: Linen shirt, kaftan, or sarong");
                response.AppendLine("• **Bottoms**: Shorts, flowy skirts, or linen pants");
                response.AppendLine("• **Tops**: Tank tops, t-shirts, light blouses");
                response.AppendLine("• **Shoes**: Sandals, flip-flops, or espadrilles");
                response.AppendLine("• **Accessories**: Wide-brim hat, sunglasses, beach bag, sunscreen!");
            }
            else if (occasion.Contains("gym") || occasion.Contains("workout") || occasion.Contains("exercise") || occasion.Contains("sport"))
            {
                response.AppendLine("💪 **Athletic/Workout Wear:**\n");
                response.AppendLine("• **Top**: Moisture-wicking t-shirt or tank top");
                response.AppendLine("• **Bottom**: Athletic shorts, leggings, or joggers");
                response.AppendLine("• **Shoes**: Proper athletic shoes for your activity");
                response.AppendLine("• **Accessories**: Sweatband, gym bag, water bottle");
                response.AppendLine("• **Tip**: Choose breathable, stretchy fabrics!");
            }
            else
            {
                response.AppendLine("To give you the best recommendations, could you tell me:\n");
                response.AppendLine("• What's the specific occasion? (party, work, date, etc.)");
                if (string.IsNullOrEmpty(size))
                    response.AppendLine("• Your size?");
                if (string.IsNullOrEmpty(colors))
                    response.AppendLine("• Preferred colors?");
                if (string.IsNullOrEmpty(budget))
                    response.AppendLine("• Your budget range?");
                response.AppendLine("\nI'll provide personalized styling advice once I know more!");
            }

            // Add size-specific note if mentioned
            if (!string.IsNullOrEmpty(size))
            {
                response.AppendLine($"\n📏 **Size Note**: For size {size.ToUpper()}, look for well-fitted pieces that flatter your body shape.");
            }

            // Add budget-specific note if mentioned
            if (!string.IsNullOrEmpty(budget))
            {
                response.AppendLine($"\n💰 **Budget Tip**: With a {budget} budget, focus on quality basics and statement pieces.");
            }

            return response.ToString();
        }

        // Remaining Extract methods (ExtractSize, ExtractGender, ExtractOccasion, etc.) remain the same.
        // ... (The rest of the code is unchanged for brevity)
        private string ExtractSize(string message)
        {
            var sizePattern = new[] { "xs", "s", "m", "l", "xl", "xxl", "xxxl", "small", "medium", "large" };
            foreach (var size in sizePattern)
            {
                if (message.Contains($"size {size}") || message.Contains($"size is {size}") || message.Contains($"{size} size"))
                {
                    return size;
                }
            }
            return "";
        }

        private string ExtractGender(string message)
        {
            if (message.Contains("men") || message.Contains("male") || message.Contains("guy") || message.Contains("man"))
                return "men";
            if (message.Contains("women") || message.Contains("female") || message.Contains("lady") || message.Contains("woman"))
                return "women";
            return "";
        }

        private string ExtractOccasion(string message)
        {
            if (message.Contains("party") || message.Contains("celebration") || message.Contains("birthday"))
                return "a party or celebration";
            if (message.Contains("office") || message.Contains("work") || message.Contains("professional") || message.Contains("interview"))
                return "professional/office setting";
            if (message.Contains("casual") || message.Contains("coffee") || message.Contains("weekend"))
                return "a casual outing";
            if (message.Contains("date") || message.Contains("dinner"))
                return "a date or dinner";
            if (message.Contains("beach") || message.Contains("vacation") || message.Contains("summer"))
                return "beach or vacation";
            if (message.Contains("gym") || message.Contains("workout") || message.Contains("exercise"))
                return "gym or workout";
            return "your occasion";
        }

        private string ExtractColors(string message)
        {
            var colors = new[] { "blue", "red", "green", "black", "white", "navy", "gray", "pink", "purple", "yellow", "orange", "brown" };
            var foundColors = colors.Where(c => message.Contains(c)).ToList();
            return foundColors.Any() ? string.Join(", ", foundColors) : "";
        }

        private string ExtractBudget(string message)
        {
            if (message.Contains("$"))
            {
                var match = System.Text.RegularExpressions.Regex.Match(message, @"\$(\d+)");
                if (match.Success)
                    return $"${match.Groups[1].Value}";
            }
            if (message.Contains("budget"))
                return "your";
            return "";
        }
    }
    // Gemini API Response Models (unchanged)
    public class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<Candidate>? Candidates { get; set; }
        
        [JsonPropertyName("usageMetadata")]
        public UsageMetadata? UsageMetadata { get; set; }
        
        [JsonPropertyName("modelVersion")]
        public string? ModelVersion { get; set; }
    }

    public class Candidate
    {
        [JsonPropertyName("content")]
        public Content? Content { get; set; }
        
        [JsonPropertyName("finishReason")]
        public string? FinishReason { get; set; }
        
        [JsonPropertyName("avgLogprobs")]
        public double? AvgLogprobs { get; set; }
    }

    public class Content
    {
        [JsonPropertyName("parts")]
        public List<Part>? Parts { get; set; }
        
        [JsonPropertyName("role")]
        public string? Role { get; set; }
    }

    public class Part
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }

    public class UsageMetadata
    {
        [JsonPropertyName("promptTokenCount")]
        public int PromptTokenCount { get; set; }
        
        [JsonPropertyName("candidatesTokenCount")]
        public int CandidatesTokenCount { get; set; }
        
        [JsonPropertyName("totalTokenCount")]
        public int TotalTokenCount { get; set; }
    }
}