using System.Text.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Trae noticias de relojería desde NewsAPI (https://newsapi.org).
    // La API key se lee de configuración (News:ApiKey), guardada en user-secrets
    // (NO en el repositorio). La URL base va en appsettings (News:BaseUrl).
    public class NoticiasService : INoticiasService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _cfg;
        private readonly ILogger<NoticiasService> _logger;

        public NoticiasService(IHttpClientFactory factory, IConfiguration cfg, ILogger<NoticiasService> logger)
        {
            _http = factory.CreateClient("news-api");
            _cfg = cfg;
            _logger = logger;
        }

        public async Task<(IReadOnlyList<NoticiaReloj> Noticias, string? Error)> ObtenerAsync()
        {
            var apiKey = _cfg["News:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
                return (Array.Empty<NoticiaReloj>(),
                    "No hay una API key de noticias configurada (News:ApiKey en user-secrets).");

            try
            {
                // Búsqueda enfocada en relojería (marcas + términos), más recientes primero.
                // Pedimos bastantes y luego filtramos por relevancia para quedarnos con 12 buenas.
                var q = Uri.EscapeDataString("\"relojes de lujo\" OR relojería OR smartwatch OR Rolex OR Seiko OR Omega");
                var url = $"v2/everything?q={q}&language=es&sortBy=publishedAt&pageSize=40";

                using var req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Add("X-Api-Key", apiKey);

                using var resp = await _http.SendAsync(req);
                if (!resp.IsSuccessStatusCode)
                {
                    _logger.LogWarning("NewsAPI respondió {Code}", resp.StatusCode);
                    return (Array.Empty<NoticiaReloj>(), "No se pudieron cargar las noticias en este momento.");
                }

                using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
                if (!doc.RootElement.TryGetProperty("articles", out var articles))
                    return (Array.Empty<NoticiaReloj>(), null);

                // Palabras que marcan una noticia como "de relojería" (filtro de relevancia).
                var claves = new[]
                {
                    "reloj", "watch", "smartwatch", "relojer", "cronógraf", "cronograf", "muñeca",
                    "rolex", "seiko", "casio", "tissot", "tag heuer", "longines", "garmin",
                    "hublot", "patek", "audemars", "g-shock"
                };

                var lista = new List<NoticiaReloj>();
                foreach (var a in articles.EnumerateArray())
                {
                    var titulo = Texto(a, "title");
                    if (string.IsNullOrWhiteSpace(titulo) || titulo == "[Removed]") continue;

                    var descripcion = Texto(a, "description");
                    var texto = (titulo + " " + descripcion).ToLowerInvariant();
                    if (!claves.Any(k => texto.Contains(k))) continue; // descarta lo que no es de relojería

                    lista.Add(new NoticiaReloj
                    {
                        Titulo = titulo,
                        Descripcion = descripcion,
                        Url = Texto(a, "url") ?? "#",
                        ImagenUrl = Texto(a, "urlToImage"),
                        Fuente = a.TryGetProperty("source", out var s) ? Texto(s, "name") : null,
                        Fecha = DateTime.TryParse(Texto(a, "publishedAt"), out var f) ? f : null,
                    });

                    if (lista.Count >= 12) break;
                }

                return (lista, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al consultar NewsAPI");
                return (Array.Empty<NoticiaReloj>(), "No se pudo conectar con el servicio de noticias.");
            }
        }

        private static string? Texto(JsonElement e, string prop) =>
            e.TryGetProperty(prop, out var v) && v.ValueKind == JsonValueKind.String ? v.GetString() : null;
    }
}
