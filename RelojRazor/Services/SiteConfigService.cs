using System.Net.Http.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Servicio que lee la configuracion del sitio desde el RelojAPI (api/configuracion).
    // Si el API no responde, devuelve una configuracion por defecto para no romper la UI.
    public class SiteConfigService : ISiteConfigService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<SiteConfigService> _logger;

        public SiteConfigService(IHttpClientFactory httpClientFactory, ILogger<SiteConfigService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("config-api");
            _logger = logger;
        }

        public async Task<SiteConfig> GetConfigAsync()
        {
            try
            {
                var config = await _httpClient.GetFromJsonAsync<SiteConfig>("api/configuracion");
                return config ?? new SiteConfig();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo cargar la configuracion del sitio; usando valores por defecto");
                return new SiteConfig();
            }
        }
    }
}
