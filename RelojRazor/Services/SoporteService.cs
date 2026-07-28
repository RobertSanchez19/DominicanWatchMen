using System.Net.Http.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Consume api/ticket del RelojAPI para el panel de soporte (rol Soporte).
    public class SoporteService : ISoporteService
    {
        private readonly HttpClient _http;
        private readonly ILogger<SoporteService> _logger;

        public SoporteService(IHttpClientFactory factory, ILogger<SoporteService> logger)
        {
            _http = factory.CreateClient("reloj-api");
            _logger = logger;
        }

        public async Task<IEnumerable<Ticket>> GetTicketsAsync(string? estado = null)
        {
            var url = string.IsNullOrWhiteSpace(estado) ? "api/ticket" : $"api/ticket?estado={Uri.EscapeDataString(estado)}";
            var result = await _http.GetFromJsonAsync<IEnumerable<Ticket>>(url);
            return result ?? Enumerable.Empty<Ticket>();
        }

        public async Task<Ticket?> GetTicketAsync(int id)
        {
            try { return await _http.GetFromJsonAsync<Ticket>($"api/ticket/{id}"); }
            catch (HttpRequestException) { return null; }
        }

        public async Task<bool> ResponderAsync(int ticketId, string autor, string texto)
        {
            _logger.LogInformation("Soporte responde ticket {Id}", ticketId);
            var response = await _http.PostAsJsonAsync($"api/ticket/{ticketId}/mensaje",
                new { autor, esSoporte = true, texto });
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> CambiarEstadoAsync(int ticketId, string estado)
        {
            var response = await _http.PutAsJsonAsync($"api/ticket/{ticketId}/estado", new { estado });
            return response.IsSuccessStatusCode;
        }
    }
}
