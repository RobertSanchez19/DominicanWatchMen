using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato para leer la configuracion del sitio (branding/portada/footer)
    // desde el RelojAPI. Se consume por inyeccion de dependencias.
    public interface ISiteConfigService
    {
        Task<SiteConfig> GetConfigAsync();
    }
}
