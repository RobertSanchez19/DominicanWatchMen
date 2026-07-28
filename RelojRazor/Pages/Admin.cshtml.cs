using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Pagina donde se pueden MODIFICAR elementos del modelo Reloj (crear, editar, eliminar).
// Los cambios se envian al Web API a traves de la clase de servicios (IRelojService).
public class AdminModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ILogger<AdminModel> _logger;

    public AdminModel(IRelojService relojService, ILogger<AdminModel> logger)
    {
        _relojService = relojService;
        _logger = logger;
    }

    // Propiedad enlazada: los datos del formulario (.cshtml) llegan al .cshtml.cs
    [BindProperty]
    public Reloj Input { get; set; } = new();

    // Datos que se pasan del .cshtml.cs hacia el .cshtml
    public List<Reloj> Relojes { get; private set; } = new();
    public List<SelectListItem> MarcasOpciones { get; private set; } = new();
    public string? Mensaje { get; set; }
    public string? Error { get; set; }
    public bool Editando => Input.Id != 0;

    public async Task OnGetAsync(int? editId)
    {
        await CargarDatosAsync();

        // Si viene un editId, precargamos ese reloj en el formulario.
        if (editId is int id && id > 0)
        {
            var reloj = await _relojService.GetByIdAsync(id);
            if (reloj is not null) Input = reloj;
        }
    }

    public async Task<IActionResult> OnPostGuardarAsync()
    {
        if (!ModelState.IsValid)
        {
            await CargarDatosAsync();
            Error = "Revisa los campos marcados.";
            return Page();
        }

        try
        {
            if (Input.Id == 0)
            {
                await _relojService.CreateRelojAsync(Input);
                Mensaje = $"Reloj «{Input.Nombre}» creado correctamente.";
            }
            else
            {
                await _relojService.UpdateRelojAsync(Input.Id, Input);
                Mensaje = $"Reloj «{Input.Nombre}» actualizado correctamente.";
            }
            Input = new Reloj(); // limpia el formulario
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin: fallo al guardar el reloj");
            Error = "No se pudo guardar. Verifica que el RelojAPI esté corriendo.";
        }

        await CargarDatosAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostEliminarAsync(int id)
    {
        try
        {
            await _relojService.DeleteRelojAsync(id);
            Mensaje = "Reloj eliminado.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin: fallo al eliminar el reloj {Id}", id);
            Error = "No se pudo eliminar el reloj.";
        }

        await CargarDatosAsync();
        return Page();
    }

    private async Task CargarDatosAsync()
    {
        try
        {
            Relojes = (await _relojService.GetAllAsync()).ToList();
            var marcas = await _relojService.GetMarcasAsync();
            MarcasOpciones = marcas
                .Select(m => new SelectListItem(m.Nombre, m.Id.ToString()))
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Admin: fallo al cargar datos del Web API");
            Error ??= "No se pudo conectar con el API.";
        }
    }
}
