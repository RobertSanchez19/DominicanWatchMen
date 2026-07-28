using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Pagina que lista las marcas retornadas por el Web API.
public class MarcasModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ILogger<MarcasModel> _logger;

    public MarcasModel(IRelojService relojService, ILogger<MarcasModel> logger)
    {
        _relojService = relojService;
        _logger = logger;
    }

    // Propiedades pasadas del .cshtml.cs hacia el .cshtml
    public List<Marca> Marcas { get; private set; } = new();
    public string? Error { get; private set; }

    public async Task OnGetAsync()
    {
        try
        {
            Marcas = (await _relojService.GetMarcasAsync()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Marcas: fallo al consultar el Web API");
            Error = "No se pudo conectar con el API. Verifica que el RelojAPI esté corriendo.";
        }
    }
}
