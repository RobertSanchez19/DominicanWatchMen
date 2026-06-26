using System.Net.Http.Json;
using RelojBlazor.Interfaces;
using RelojBlazor.Models;

namespace RelojBlazor.Services
{
    // Scoped: una instancia por circuito SignalR. Cachea la configuración del sitio
    // para que el layout y la portada la lean sin pegarle a la API en cada render.
    public class SiteConfigService : ISiteConfigService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SiteConfigService> _logger;
        private bool _cargado;

        public SiteConfig Config { get; private set; } = new();
        public event Action? OnCambio;

        public SiteConfigService(IHttpClientFactory httpClientFactory, ILogger<SiteConfigService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("config-api");
            _logger = logger;
        }

        public async Task CargarAsync()
        {
            if (_cargado) return;
            try
            {
                var config = await _httpClient.GetFromJsonAsync<SiteConfig>("api/configuracion");
                if (config != null)
                {
                    Config = config;
                    _cargado = true;
                    OnCambio?.Invoke();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "No se pudo cargar la configuración del sitio; se usan valores por defecto");
            }
        }

        public async Task<bool> GuardarAsync(SiteConfig nuevo)
        {
            try
            {
                var response = await _httpClient.PutAsJsonAsync("api/configuracion", nuevo);
                if (!response.IsSuccessStatusCode) return false;

                var actualizado = await response.Content.ReadFromJsonAsync<SiteConfig>();
                if (actualizado != null) Config = actualizado;
                _cargado = true;
                OnCambio?.Invoke();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al guardar la configuración del sitio");
                return false;
            }
        }
    }
}
