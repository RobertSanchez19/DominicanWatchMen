using System.Globalization;
using System.Text;
using System.Text.Json;
using RelojRazor.Interfaces;

namespace RelojRazor.Services
{
    // Enriquecimiento de marcas con fuentes GRATIS y sin API key:
    //  - Wikipedia (es): descripción (extract) y logo (imagen del artículo).
    //  - Google favicon como respaldo del logo si Wikipedia no trae imagen.
    public class MarcaWebService : IMarcaWebService
    {
        private readonly HttpClient _http;
        private readonly ILogger<MarcaWebService> _logger;

        public MarcaWebService(IHttpClientFactory factory, ILogger<MarcaWebService> logger)
        {
            _http = factory.CreateClient("marca-web");
            _logger = logger;
        }

        public async Task<MarcaEnriquecida> EnriquecerAsync(string nombre)
        {
            nombre = (nombre ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(nombre))
                return new MarcaEnriquecida(null, null, null, "Escribe primero el nombre de la marca.");

            var (descripcion, imagen) = await WikipediaAsync(nombre);

            // Logo: primero el del artículo de Wikipedia; si no hay, el favicon del dominio.
            var logoUrl = imagen ?? FaviconGoogle(nombre);

            var partes = new List<string>
            {
                descripcion is not null ? "descripción (Wikipedia)" : "sin descripción en Wikipedia",
                imagen is not null ? "logo (Wikipedia)" : "logo aproximado (favicon)"
            };
            var aviso = $"Autocompletado: {string.Join(" · ", partes)}. Revisa y completa el país si hace falta.";

            // El país no se obtiene de forma fiable de estas fuentes: se deja al usuario.
            return new MarcaEnriquecida(descripcion, logoUrl, null, aviso);
        }

        // Una sola llamada al resumen REST de Wikipedia devuelve texto e imagen.
        private async Task<(string? Descripcion, string? Imagen)> WikipediaAsync(string nombre)
        {
            try
            {
                var titulo = Uri.EscapeDataString(nombre.Replace(' ', '_'));
                var url = $"https://es.wikipedia.org/api/rest_v1/page/summary/{titulo}";
                using var resp = await _http.GetAsync(url);
                if (!resp.IsSuccessStatusCode) return (null, null);

                using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync());
                var root = doc.RootElement;

                // Evita páginas de desambiguación.
                if (root.TryGetProperty("type", out var t) && t.GetString() == "disambiguation")
                    return (null, null);

                string? descripcion = null;
                if (root.TryGetProperty("extract", out var ex) && ex.ValueKind == JsonValueKind.String)
                {
                    var extract = ex.GetString();
                    if (!string.IsNullOrWhiteSpace(extract)) descripcion = extract!.Trim();
                }

                // Imagen: preferimos la original; si no, la miniatura.
                string? imagen = ImagenDe(root, "originalimage") ?? ImagenDe(root, "thumbnail");

                return (descripcion, imagen);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Wikipedia falló para {Nombre}", nombre);
                return (null, null);
            }
        }

        private static string? ImagenDe(JsonElement root, string prop) =>
            root.TryGetProperty(prop, out var img) &&
            img.TryGetProperty("source", out var src) && src.ValueKind == JsonValueKind.String
                ? src.GetString() : null;

        // Favicon del dominio adivinado (marca -> marca.com) vía Google. Siempre responde algo.
        private static string FaviconGoogle(string nombre)
        {
            var dominio = SlugDominio(nombre);
            return $"https://www.google.com/s2/favicons?domain={dominio}&sz=128";
        }

        // "TAG Heuer" -> "tagheuer.com" (minúsculas, sin acentos ni símbolos).
        private static string SlugDominio(string nombre)
        {
            var sinAcentos = new string(nombre.Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray());
            var slug = new string(sinAcentos.ToLowerInvariant().Where(char.IsLetterOrDigit).ToArray());
            return slug.Length == 0 ? "example.com" : slug + ".com";
        }
    }
}
