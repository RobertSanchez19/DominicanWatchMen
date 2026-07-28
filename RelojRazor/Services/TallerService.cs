using System.Net.Http.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Consume api/pieza del RelojAPI para el taller de fabricación (rol Fabricante).
    public class TallerService : ITallerService
    {
        private readonly HttpClient _http;
        private readonly ILogger<TallerService> _logger;

        public TallerService(IHttpClientFactory factory, ILogger<TallerService> logger)
        {
            _http = factory.CreateClient("reloj-api");
            _logger = logger;
        }

        public async Task<IEnumerable<Pieza>> GetPiezasAsync()
        {
            var result = await _http.GetFromJsonAsync<IEnumerable<Pieza>>("api/pieza");
            return result ?? Enumerable.Empty<Pieza>();
        }

        public async Task<Pieza?> CreatePiezaAsync(Pieza pieza)
        {
            _logger.LogInformation("Creando pieza: {Categoria} {Nombre}", pieza.Categoria, pieza.Nombre);
            var response = await _http.PostAsJsonAsync("api/pieza", pieza);
            if (!response.IsSuccessStatusCode) return null;
            return await response.Content.ReadFromJsonAsync<Pieza>();
        }

        public async Task<bool> DeletePiezaAsync(int id)
        {
            var response = await _http.DeleteAsync($"api/pieza/{id}");
            return response.IsSuccessStatusCode;
        }
    }
}
