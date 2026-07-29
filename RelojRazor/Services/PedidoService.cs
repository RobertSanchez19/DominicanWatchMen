using System.Net.Http.Json;
using System.Text.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Consume api/pedido del RelojAPI para el checkout (crear orden y consultarla).
    public class PedidoService : IPedidoService
    {
        private readonly HttpClient _http;
        private readonly ILogger<PedidoService> _logger;

        public PedidoService(IHttpClientFactory factory, ILogger<PedidoService> logger)
        {
            _http = factory.CreateClient("reloj-api");
            _logger = logger;
        }

        public async Task<(Pedido? Pedido, string? Error)> CrearPedidoAsync(CrearPedidoRequest request)
        {
            try
            {
                var response = await _http.PostAsJsonAsync("api/pedido", request);
                if (response.IsSuccessStatusCode)
                {
                    var pedido = await response.Content.ReadFromJsonAsync<Pedido>();
                    _logger.LogInformation("Pedido creado: {Id}", pedido?.Id);
                    return (pedido, null);
                }

                // El API devuelve { mensaje } cuando algo falla (p. ej. sin stock).
                var mensaje = await LeerMensajeError(response);
                _logger.LogWarning("Crear pedido falló {Status}: {Msg}", (int)response.StatusCode, mensaje);
                return (null, mensaje ?? "No se pudo procesar el pedido.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear el pedido");
                return (null, "No se pudo conectar con el servidor. Verifica que el RelojAPI esté corriendo.");
            }
        }

        public async Task<Pedido?> GetPedidoAsync(int id)
        {
            try { return await _http.GetFromJsonAsync<Pedido>($"api/pedido/{id}"); }
            catch (HttpRequestException) { return null; }
        }

        private static async Task<string?> LeerMensajeError(HttpResponseMessage response)
        {
            try
            {
                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                if (doc.RootElement.TryGetProperty("mensaje", out var m)) return m.GetString();
            }
            catch { /* sin cuerpo JSON */ }
            return null;
        }
    }
}
