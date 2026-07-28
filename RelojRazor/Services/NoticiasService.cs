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
                // Relojería CLÁSICA / mecánica / de lujo. Se busca en inglés porque ahí están
                // las publicaciones especializadas (Hodinkee, Fratello...); en español casi no hay.
                var q = Uri.EscapeDataString(
                    "\"luxury watch\" OR \"mechanical watch\" OR \"swiss watch\" OR watchmaking OR wristwatch OR " +
                    "Rolex OR \"Patek Philippe\" OR \"Audemars Piguet\" OR Omega OR \"TAG Heuer\" OR Cartier OR Tudor OR Breitling");
                var url = $"v2/everything?q={q}&language=en&sortBy=publishedAt&pageSize=100";

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

                // Señales fuertes de reloj CLÁSICO: marcas de lujo inequívocas...
                var marcas = new[]
                {
                    "rolex", "patek philippe", "audemars piguet", "tag heuer", "cartier",
                    "tudor", "longines", "jaeger-lecoultre", "breitling", "hublot",
                    "vacheron", "panerai", "grand seiko", "montblanc", "zenith", "seiko", "hodinkee"
                };
                // ...o frases claras de relojería tradicional (inglés y español).
                var frases = new[]
                {
                    "luxury watch", "mechanical watch", "swiss watch", "wristwatch", "watchmaking",
                    "chronograph", "dive watch", "pocket watch", "gmt watch", "automatic watch", "watch brand",
                    "reloj de lujo", "reloj mecánico", "alta relojería", "reloj clásico"
                };
                // Se descartan smartwatches/digitales y falsos positivos frecuentes.
                var excluir = new[]
                {
                    "smartwatch", "smart watch", "reloj inteligente", "apple watch", "galaxy watch",
                    "wear os", "garmin", "fitbit", "amazfit", "xiaomi", "g-shock", "wearable",
                    "omega-3", "omega 3", "coenzima", "kenny omega", "aew", "wwe", "wrestling",
                    "fanfic", "archive of our own"
                };

                var lista = new List<NoticiaReloj>();
                foreach (var a in articles.EnumerateArray())
                {
                    var titulo = Texto(a, "title");
                    if (string.IsNullOrWhiteSpace(titulo) || titulo == "[Removed]") continue;

                    var descripcion = Texto(a, "description");
                    var texto = (titulo + " " + descripcion).ToLowerInvariant();
                    // Debe tener una marca de lujo o una frase clara de relojería clásica...
                    if (!marcas.Any(k => texto.Contains(k)) && !frases.Any(k => texto.Contains(k))) continue;
                    // ...y no ser de relojes digitales/inteligentes ni un falso positivo.
                    if (excluir.Any(k => texto.Contains(k))) continue;

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
