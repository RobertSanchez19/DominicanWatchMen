using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Panel de soporte (rol Soporte / Admin): lista de tickets, hilo de mensajes,
// responder y cambiar el estado. Consume api/ticket a través de ISoporteService.
public class SoporteModel : PageModel
{
    private readonly ISoporteService _soporte;
    private readonly ILogger<SoporteModel> _logger;

    public SoporteModel(ISoporteService soporte, ILogger<SoporteModel> logger)
    {
        _soporte = soporte;
        _logger = logger;
    }

    [BindProperty(SupportsGet = true)] public int? Id { get; set; }
    [BindProperty] public string Respuesta { get; set; } = string.Empty;

    public List<Ticket> Tickets { get; private set; } = new();
    public Ticket? Seleccionado { get; private set; }
    public string? Mensaje { get; set; }
    public string? Error { get; set; }

    public static readonly string[] Estados = { "Abierto", "En progreso", "Resuelto", "Cerrado" };

    public async Task OnGetAsync() => await CargarAsync();

    public async Task<IActionResult> OnPostResponderAsync(int id)
    {
        if (string.IsNullOrWhiteSpace(Respuesta))
        {
            Error = "Escribe una respuesta.";
            Id = id;
            await CargarAsync();
            return Page();
        }

        var autor = User.FindFirst("Nombre")?.Value ?? "Soporte";
        var ok = await _soporte.ResponderAsync(id, autor, Respuesta.Trim());
        if (!ok) Error = "No se pudo enviar la respuesta.";
        return RedirectToPage(new { id });
    }

    public async Task<IActionResult> OnPostEstadoAsync(int id, string estado)
    {
        var ok = await _soporte.CambiarEstadoAsync(id, estado);
        if (!ok) Error = "No se pudo cambiar el estado.";
        return RedirectToPage(new { id });
    }

    private async Task CargarAsync()
    {
        try
        {
            Tickets = (await _soporte.GetTicketsAsync()).ToList();
            if (Id is int id)
                Seleccionado = await _soporte.GetTicketAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Soporte: fallo al cargar tickets");
            Error ??= "No se pudo conectar con el API.";
        }
    }
}
