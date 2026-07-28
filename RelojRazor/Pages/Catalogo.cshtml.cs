using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Pagina que VISUALIZA elementos retornados desde el Web API (relojes).
public class CatalogoModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ILogger<CatalogoModel> _logger;

    public CatalogoModel(IRelojService relojService, ILogger<CatalogoModel> logger)
    {
        _relojService = relojService;
        _logger = logger;
    }

    // Propiedad que viaja del .cshtml (input de busqueda por query string) hacia el .cshtml.cs
    [BindProperty(SupportsGet = true)]
    public string? Busqueda { get; set; }

    // Propiedades que se pasan del .cshtml.cs hacia el .cshtml
    public List<Reloj> Relojes { get; private set; } = new();
    public string? Error { get; private set; }

    public async Task OnGetAsync()
    {
        try
        {
            var todos = (await _relojService.GetAllAsync()).ToList();

            // Filtra segun el texto que el usuario escribio en la vista.
            if (!string.IsNullOrWhiteSpace(Busqueda))
            {
                var q = Busqueda.Trim();
                todos = todos.Where(r =>
                    r.Nombre.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    r.Modelo.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                    (r.Marca?.Nombre ?? "").Contains(q, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            Relojes = todos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Catalogo: fallo al consultar el Web API");
            Error = "No se pudo conectar con el API. Verifica que el RelojAPI esté corriendo en http://localhost:5157.";
        }
    }
}
