using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Taller de fabricación (rol Fabricante / Admin): inventario de piezas para armar relojes.
public class TallerModel : PageModel
{
    private readonly ITallerService _taller;
    private readonly ILogger<TallerModel> _logger;

    public TallerModel(ITallerService taller, ILogger<TallerModel> logger)
    {
        _taller = taller;
        _logger = logger;
    }

    [BindProperty] public Pieza Input { get; set; } = new();

    public List<Pieza> Piezas { get; private set; } = new();
    public string? Mensaje { get; set; }
    public string? Error { get; set; }

    // Categorías disponibles para el selector.
    public static readonly string[] Categorias =
        { "Case", "Dial", "Bezel", "Aguja", "Maquina", "Pulsera" };

    public async Task OnGetAsync() => await CargarAsync();

    public async Task<IActionResult> OnPostGuardarAsync()
    {
        if (!ModelState.IsValid)
        {
            Error = "Revisa los campos marcados.";
            await CargarAsync();
            return Page();
        }

        try
        {
            var creada = await _taller.CreatePiezaAsync(Input);
            if (creada is null) Error = "No se pudo crear la pieza. Verifica que el RelojAPI esté corriendo.";
            else { Mensaje = $"Pieza «{creada.Nombre}» agregada al taller."; Input = new Pieza(); }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Taller: fallo al crear la pieza");
            Error = "No se pudo crear la pieza.";
        }

        await CargarAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostEliminarAsync(int id)
    {
        try
        {
            var ok = await _taller.DeletePiezaAsync(id);
            Mensaje = ok ? "Pieza eliminada." : null;
            if (!ok) Error = "No se pudo eliminar la pieza.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Taller: fallo al eliminar la pieza {Id}", id);
            Error = "No se pudo eliminar la pieza.";
        }

        await CargarAsync();
        return Page();
    }

    private async Task CargarAsync()
    {
        try
        {
            Piezas = (await _taller.GetPiezasAsync()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Taller: fallo al cargar piezas");
            Error ??= "No se pudo conectar con el API.";
        }
    }
}
