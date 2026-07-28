using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Gestión de marcas (solo Admin): crear una marca y AUTOCOMPLETAR sus datos
// (descripción + logo) desde fuentes web gratis (Wikipedia + Clearbit).
public class AdminMarcasModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly IMarcaWebService _marcaWeb;
    private readonly ILogger<AdminMarcasModel> _logger;

    public AdminMarcasModel(IRelojService relojService, IMarcaWebService marcaWeb, ILogger<AdminMarcasModel> logger)
    {
        _relojService = relojService;
        _marcaWeb = marcaWeb;
        _logger = logger;
    }

    [BindProperty] public Marca Input { get; set; } = new();

    public List<Marca> Marcas { get; private set; } = new();
    public string? Mensaje { get; set; }
    public string? Error { get; set; }
    public string? AvisoAuto { get; set; }

    public async Task OnGetAsync() => await CargarAsync();

    // Autocompletar: busca descripción y logo por el nombre y rellena el formulario.
    public async Task<IActionResult> OnPostAutocompletarAsync()
    {
        if (string.IsNullOrWhiteSpace(Input.Nombre))
        {
            Error = "Escribe primero el nombre de la marca para autocompletar.";
            await CargarAsync();
            return Page();
        }

        var datos = await _marcaWeb.EnriquecerAsync(Input.Nombre);
        if (!string.IsNullOrWhiteSpace(datos.Descripcion)) Input.Descripcion = datos.Descripcion;
        if (!string.IsNullOrWhiteSpace(datos.LogoUrl)) Input.LogoUrl = datos.LogoUrl;
        if (!string.IsNullOrWhiteSpace(datos.PaisOrigen)) Input.PaisOrigen = datos.PaisOrigen;
        AvisoAuto = datos.Aviso;

        await CargarAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostGuardarAsync()
    {
        if (string.IsNullOrWhiteSpace(Input.Nombre))
        {
            Error = "El nombre de la marca es obligatorio.";
            await CargarAsync();
            return Page();
        }

        try
        {
            var creada = await _relojService.CreateMarcaAsync(Input);
            if (creada is null) Error = "No se pudo crear la marca. Verifica que el RelojAPI esté corriendo.";
            else { Mensaje = $"Marca «{creada.Nombre}» creada correctamente."; Input = new Marca(); }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AdminMarcas: fallo al crear la marca");
            Error = "No se pudo crear la marca.";
        }

        await CargarAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostEliminarAsync(int id)
    {
        try
        {
            var ok = await _relojService.DeleteMarcaAsync(id);
            Mensaje = ok ? "Marca eliminada." : null;
            if (!ok) Error = "No se pudo eliminar la marca (puede tener relojes asociados).";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AdminMarcas: fallo al eliminar la marca {Id}", id);
            Error = "No se pudo eliminar la marca.";
        }

        await CargarAsync();
        return Page();
    }

    private async Task CargarAsync()
    {
        try
        {
            Marcas = (await _relojService.GetMarcasAsync()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AdminMarcas: fallo al cargar marcas");
            Error ??= "No se pudo conectar con el API.";
        }
    }
}
