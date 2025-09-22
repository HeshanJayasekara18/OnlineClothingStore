// Controllers/WeatherForecastController.cs
using Microsoft.AspNetCore.Mvc;

namespace ClothStoreApi.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new[]
        {
            new { Date = DateTime.Now, TemperatureC = 25, Summary = "Sunny" }
        });
    }
}
