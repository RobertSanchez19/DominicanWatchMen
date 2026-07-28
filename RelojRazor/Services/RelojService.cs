using System.Net.Http.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Capa de servicios que conecta con el Web API (RelojAPI) usando HttpClient.
    // Recibe por inyeccion de dependencias: HttpClient (tipado), ILogger e IConfiguration.
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

        public async Task<Reloj?> GetByIdAsync(int id)
        {
            _logger.LogInformation("Consultando reloj Id {Id}", id);
            try
            {
                return await _httpClient.GetFromJsonAsync<Reloj>($"api/reloj/{id}");
            }
            catch (HttpRequestException)
            {
                return null;
            }
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

        // ── Marcas ─────────────────────────────────────────────────────────────

        public async Task<IEnumerable<Marca>> GetMarcasAsync()
        {
            var api = _configuration["ApiSettings:Nombre"] ?? "RelojAPI";
            _logger.LogInformation("Consultando marcas desde {Api}", api);
            var result = await _httpClient.GetFromJsonAsync<IEnumerable<Marca>>("api/marca");
            _logger.LogInformation("Se obtuvieron {Count} marcas", result?.Count() ?? 0);
            return result ?? Enumerable.Empty<Marca>();
        }

        public async Task<Marca?> GetMarcaByIdAsync(int id)
        {
            _logger.LogInformation("Consultando marca Id {Id}", id);
            try
            {
                return await _httpClient.GetFromJsonAsync<Marca>($"api/marca/{id}");
            }
            catch (HttpRequestException)
            {
                return null;
            }
        }

        public async Task<Marca?> CreateMarcaAsync(Marca marca)
        {
            // El binding de Razor convierte los campos vacios en null; el API/BD no
            // aceptan null en estos strings, asi que los normalizamos a cadena vacia.
            marca.Nombre ??= string.Empty;
            marca.PaisOrigen ??= string.Empty;
            marca.Descripcion ??= string.Empty;

            _logger.LogInformation("Creando marca: {Nombre}", marca.Nombre);
            var response = await _httpClient.PostAsJsonAsync("api/marca", marca);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("CrearMarca fallo {Status}: {Body}", (int)response.StatusCode, body);
                return null;
            }
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
