using RelojBlazor.Models;

namespace RelojBlazor.Interfaces
{
    public interface ISiteConfigService
    {
        // Configuración actual (siempre disponible: arranca con valores por defecto)
        SiteConfig Config { get; }

        // Carga la configuración desde la API (una sola vez por circuito)
        Task CargarAsync();

        // Guarda la configuración en la API y notifica el cambio
        Task<bool> GuardarAsync(SiteConfig config);

        // Se dispara cuando la configuración cambia (para refrescar layout/portada)
        event Action? OnCambio;
    }
}
