using System.Net.Http.Json;
using RelojBlazor.Interfaces;
using RelojBlazor.Models;

namespace RelojBlazor.Services
{
    public class RelojService : IRelojService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RelojService> _logger;
        private readonly IConfiguration _configuration;

        public RelojService(HttpClient httpClient, ILogger<RelojService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }

        // ── Relojes ────────────────────────────────────────────────────────────

        public async Task<IEnumerable<Reloj>> GetAllAsync()
        {
            var api = _configuration["ApiSettings:Nombre"] ?? "RelojAPI";
            _logger.LogInformation("Consultando relojes desde {Api}", api);
            var result = await _httpClient.GetFromJsonAsync<IEnumerable<Reloj>>("api/reloj");
            _logger.LogInformation("Se obtuvieron {Count} relojes", result?.Count() ?? 0);
            return result ?? Enumerable.Empty<Reloj>();
        }

        public async Task<Reloj> CreateRelojAsync(Reloj reloj)
        {
            _logger.LogInformation("Creando reloj: {Nombre}", reloj.Nombre);
            var response = await _httpClient.PostAsJsonAsync("api/reloj", reloj);
            response.EnsureSuccessStatusCode();
            var creado = await response.Content.ReadFromJsonAsync<Reloj>();
            _logger.LogInformation("Reloj creado con Id {Id}", creado?.Id);
            return creado!;
        }

        public async Task<Reloj?> UpdateRelojAsync(int id, Reloj reloj)
        {
            _logger.LogInformation("Actualizando reloj Id {Id}", id);
            var response = await _httpClient.PutAsJsonAsync($"api/reloj/{id}", reloj);
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<Reloj>();
        }

        public async Task<bool> DeleteRelojAsync(int id)
        {
            _logger.LogInformation("Eliminando reloj Id {Id}", id);
            var response = await _httpClient.DeleteAsync($"api/reloj/{id}");
            return response.IsSuccessStatusCode;
        }

        public async Task<string?> UploadImageAsync(Stream fileStream, string fileName, string contentType)
        {
            _logger.LogInformation("Subiendo imagen: {FileName}", fileName);
            using var content = new MultipartFormDataContent();
            using var streamContent = new StreamContent(fileStream);
            streamContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            content.Add(streamContent, "archivo", fileName);

            var response = await _httpClient.PostAsync("api/upload", content);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Fallo al subir imagen: {Status}", response.StatusCode);
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<UploadResult>();
            _logger.LogInformation("Imagen subida: {Url}", result?.Url);
            return result?.Url;
        }

        // ── Marcas ─────────────────────────────────────────────────────────────

        public async Task<IEnumerable<Marca>> GetMarcasAsync()
        {
            var api = _configuration["ApiSettings:Nombre"] ?? "RelojAPI";
            _logger.LogInformation("Consultando marcas desde {Api}", api);
            var result = await _httpClient.GetFromJsonAsync<IEnumerable<Marca>>("api/marca");
            _logger.LogInformation("Se obtuvieron {Count} marcas", result?.Count() ?? 0);
            return result ?? Enumerable.Empty<Marca>();
        }

        public async Task<Marca> CreateMarcaAsync(Marca marca)
        {
            _logger.LogInformation("Creando marca: {Nombre}", marca.Nombre);
            var response = await _httpClient.PostAsJsonAsync("api/marca", marca);
            response.EnsureSuccessStatusCode();
            var creada = await response.Content.ReadFromJsonAsync<Marca>();
            _logger.LogInformation("Marca creada con Id {Id}", creada?.Id);
            return creada!;
        }

        public async Task<Marca?> UpdateMarcaAsync(int id, Marca marca)
        {
            _logger.LogInformation("Actualizando marca Id {Id}", id);
            var response = await _httpClient.PutAsJsonAsync($"api/marca/{id}", marca);
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<Marca>();
        }

        public async Task<bool> DeleteMarcaAsync(int id)
        {
            _logger.LogInformation("Eliminando marca Id {Id}", id);
            var response = await _httpClient.DeleteAsync($"api/marca/{id}");
            return response.IsSuccessStatusCode;
        }
    }
}
