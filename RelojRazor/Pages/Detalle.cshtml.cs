using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Detalle / configurador de un reloj (modelo ensamble-a-pedido):
// se elige una maquina y una pulsera (independientes) y se anade al carrito.
// Visualiza datos del API (IRelojService) y modifica el carrito (ICarritoService).
public class DetalleModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ICarritoService _carrito;
    private readonly ILogger<DetalleModel> _logger;

    public DetalleModel(IRelojService relojService, ICarritoService carrito, ILogger<DetalleModel> logger)
    {
        _relojService = relojService;
        _carrito = carrito;
        _logger = logger;
    }

    // Reloj que se muestra (llega del API con sus componentes compatibles).
    public Reloj? Reloj { get; private set; }
    public string? Error { get; private set; }

    // Seleccion que viaja del formulario (.cshtml) al PageModel (.cshtml.cs).
    [BindProperty]
    public int MovimientoId { get; set; }
    [BindProperty]
    public int TipoPulseraId { get; set; }
    [BindProperty]
    public int Cantidad { get; set; } = 1;

    // true cuando el reloj no tiene maquinas o pulseras configuradas.
    public bool SinOpciones => Reloj is null
        || Reloj.MovimientosCompatibles.Count == 0
        || Reloj.PulserasCompatibles.Count == 0;

    public async Task<IActionResult> OnGetAsync(int id)
    {
        Reloj = await CargarAsync(id);
        if (Reloj is null)
        {
            Error = "No se encontro el reloj solicitado o el API no responde.";
            return Page();
        }

        // Preseleccion: primera maquina y primera pulsera con stock disponible.
        MovimientoId = Reloj.MovimientosCompatibles.FirstOrDefault(m => m.Stock > 0)?.Id
                       ?? Reloj.MovimientosCompatibles.FirstOrDefault()?.Id ?? 0;
        TipoPulseraId = Reloj.PulserasCompatibles.FirstOrDefault(p => p.Stock > 0)?.Id
                        ?? Reloj.PulserasCompatibles.FirstOrDefault()?.Id ?? 0;
        return Page();
    }

    public async Task<IActionResult> OnPostAgregarAsync(int id)
    {
        Reloj = await CargarAsync(id);
        if (Reloj is null)
        {
            Error = "No se encontro el reloj solicitado o el API no responde.";
            return Page();
        }

        // El precio y el stock SIEMPRE se recalculan aqui con los datos del API,
        // nunca se confia en lo que envie el navegador (buena practica de seguridad).
        var maquina = Reloj.MovimientosCompatibles.FirstOrDefault(m => m.Id == MovimientoId);
        var pulsera = Reloj.PulserasCompatibles.FirstOrDefault(p => p.Id == TipoPulseraId);

        if (maquina is null || pulsera is null)
        {
            Error = "Selecciona una maquina y una pulsera validas.";
            return Page();
        }

        var disponible = Disponibilidad(Reloj, maquina, pulsera);
        if (disponible <= 0)
        {
            Error = "Esta configuracion esta agotada. Prueba con otra maquina o pulsera.";
            return Page();
        }

        var cantidad = Math.Clamp(Cantidad, 1, disponible);

        _carrito.Agregar(new CarritoItem
        {
            RelojId = Reloj.Id,
            RelojNombre = Reloj.Nombre,
            ImagenUrl = Reloj.ImagenUrl,
            MovimientoId = maquina.Id,
            Maquina = maquina.Nombre,
            TipoPulseraId = pulsera.Id,
            Pulsera = pulsera.Nombre,
            PrecioUnitario = PrecioUnitario(Reloj, maquina, pulsera),
            Cantidad = cantidad,
        });

        _logger.LogInformation("Carrito: agregado reloj {Id} ({Cant}) maquina {Maq} pulsera {Pul}",
            Reloj.Id, cantidad, maquina.Nombre, pulsera.Nombre);

        return RedirectToPage("/Carrito");
    }

    // ── Helpers de calculo (tambien los usa la vista) ────────────────────────
    public static decimal PrecioUnitario(Reloj r, Movimiento m, TipoPulsera p) =>
        r.Precio + m.PrecioExtra + p.PrecioExtra;

    public static int Disponibilidad(Reloj r, Movimiento m, TipoPulsera p) =>
        Math.Min(r.Stock, Math.Min(m.Stock, p.Stock));

    private async Task<Reloj?> CargarAsync(int id)
    {
        try
        {
            return await _relojService.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Detalle: fallo al cargar el reloj {Id}", id);
            return null;
        }
    }
}
