using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// PageModel del Landing Page.
// Usa inyeccion de dependencias: IRelojService, ISiteConfigService e ILogger.
public class IndexModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ISiteConfigService _siteConfig;
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(IRelojService relojService, ISiteConfigService siteConfig, ILogger<IndexModel> logger)
    {
        _relojService = relojService;
        _siteConfig = siteConfig;
        _logger = logger;
    }

    // Propiedades que se pasan del .cshtml.cs hacia el .cshtml (para la portada)
    public SiteConfig Config { get; private set; } = new();
    public List<Reloj> Destacados { get; private set; } = new();
    public Reloj? RelojPortada => Destacados.FirstOrDefault();

    public async Task OnGetAsync()
    {
        Config = await _siteConfig.GetConfigAsync();
        try
        {
            var todos = await _relojService.GetAllAsync();
            Destacados = todos.Where(r => r.Destacado).ToList();
            _logger.LogInformation("Landing: {Count} relojes destacados", Destacados.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Landing: no se pudieron cargar los relojes destacados");
        }
    }
}
