using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Detalle de una marca: muestra su información (logo, país, descripción) y sus relojes.
public class MarcaDetalleModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly IMarcaWebService _marcaWeb;
    private readonly ILogger<MarcaDetalleModel> _logger;

    public MarcaDetalleModel(IRelojService relojService, IMarcaWebService marcaWeb, ILogger<MarcaDetalleModel> logger)
    {
        _relojService = relojService;
        _marcaWeb = marcaWeb;
        _logger = logger;
    }

    public Marca? Marca { get; private set; }
    public string? Error { get; private set; }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        try
        {
            Marca = await _relojService.GetMarcaByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MarcaDetalle: fallo al cargar la marca {Id}", id);
        }

        if (Marca is null)
        {
            Error = "No se encontró la marca solicitada o el API no responde.";
            return Page();
        }

        // Si la marca no tiene descripción/logo guardados, se traen en vivo de la web
        // (Wikipedia) para que la página siempre muestre información de la marca.
        if (string.IsNullOrWhiteSpace(Marca.Descripcion) || string.IsNullOrWhiteSpace(Marca.LogoUrl))
        {
            var datos = await _marcaWeb.EnriquecerAsync(Marca.Nombre);
            if (string.IsNullOrWhiteSpace(Marca.Descripcion)) Marca.Descripcion = datos.Descripcion;
            if (string.IsNullOrWhiteSpace(Marca.LogoUrl)) Marca.LogoUrl = datos.LogoUrl;
        }

        return Page();
    }
}
