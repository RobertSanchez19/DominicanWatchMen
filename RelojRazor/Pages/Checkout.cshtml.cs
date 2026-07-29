using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Checkout: datos de envío + método de pago (tarjeta simulada o contra entrega),
// coloca la orden en el API (que valida stock y calcula ITBIS/envío) y redirige a la confirmación.
public class CheckoutModel : PageModel
{
    private readonly ICarritoService _carrito;
    private readonly IPedidoService _pedidos;
    private readonly ILogger<CheckoutModel> _logger;

    public CheckoutModel(ICarritoService carrito, IPedidoService pedidos, ILogger<CheckoutModel> logger)
    {
        _carrito = carrito;
        _pedidos = pedidos;
        _logger = logger;
    }

    // ===== Datos del formulario (viajan de la vista al PageModel) =====
    [BindProperty] public string Nombre { get; set; } = string.Empty;
    [BindProperty] public string Apellido { get; set; } = string.Empty;
    [BindProperty] public string Email { get; set; } = string.Empty;
    [BindProperty] public string Telefono { get; set; } = string.Empty;
    [BindProperty] public string Direccion { get; set; } = string.Empty;
    [BindProperty] public string Ciudad { get; set; } = string.Empty;
    [BindProperty] public string Provincia { get; set; } = string.Empty;
    [BindProperty] public string? CodigoPostal { get; set; }
    [BindProperty] public string? Referencia { get; set; }
    [BindProperty] public string? CuponCodigo { get; set; }

    [BindProperty] public string MetodoPago { get; set; } = "Tarjeta de crédito";
    // Datos de tarjeta (SIMULADOS: no se guardan ni se envían al API).
    [BindProperty] public string? NumeroTarjeta { get; set; }
    [BindProperty] public string? Vencimiento { get; set; }
    [BindProperty] public string? Cvv { get; set; }
    [BindProperty] public string? TitularTarjeta { get; set; }

    // ===== Datos que el PageModel pasa a la vista =====
    public IReadOnlyList<CarritoItem> Items { get; private set; } = new List<CarritoItem>();
    public decimal Subtotal { get; private set; }
    public decimal Itbis { get; private set; }
    public string? Error { get; set; }

    // Provincias donde el envío es RD$200 (igual que el cálculo del API).
    public static readonly string[] Provincias =
    {
        "Distrito Nacional", "Santo Domingo", "Santiago", "La Vega", "San Cristóbal",
        "Puerto Plata", "La Romana", "San Pedro de Macorís", "Duarte", "Espaillat", "Otra"
    };

    public IActionResult OnGet()
    {
        Cargar();
        if (Items.Count == 0) return RedirectToPage("/Carrito");
        return Page();
    }

    public async Task<IActionResult> OnPostConfirmarAsync()
    {
        Cargar();
        if (Items.Count == 0) return RedirectToPage("/Carrito");

        // Validación de datos de envío.
        if (string.IsNullOrWhiteSpace(Nombre) || string.IsNullOrWhiteSpace(Apellido) ||
            string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Telefono) ||
            string.IsNullOrWhiteSpace(Direccion) || string.IsNullOrWhiteSpace(Ciudad) ||
            string.IsNullOrWhiteSpace(Provincia))
        {
            Error = "Completa todos los datos de envío (nombre, apellido, correo, teléfono, dirección, ciudad y provincia).";
            return Page();
        }
        if (!Regex.IsMatch(Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            Error = "El correo no es válido.";
            return Page();
        }

        // Validación de la tarjeta (simulada) solo si se paga con tarjeta.
        if (MetodoPago == "Tarjeta de crédito")
        {
            var num = (NumeroTarjeta ?? "").Replace(" ", "").Replace("-", "");
            if (!Regex.IsMatch(num, @"^\d{13,19}$"))
            {
                Error = "El número de tarjeta no es válido (13 a 19 dígitos).";
                return Page();
            }
            if (!Regex.IsMatch(Vencimiento ?? "", @"^(0[1-9]|1[0-2])\/\d{2}$"))
            {
                Error = "El vencimiento debe tener el formato MM/AA.";
                return Page();
            }
            if (!Regex.IsMatch(Cvv ?? "", @"^\d{3,4}$"))
            {
                Error = "El CVV debe tener 3 o 4 dígitos.";
                return Page();
            }
        }

        // Se arma el pedido con los items del carrito (el API recalcula precios y valida stock).
        var request = new CrearPedidoRequest
        {
            NombreCliente = Nombre.Trim(),
            ApellidoCliente = Apellido.Trim(),
            Email = Email.Trim(),
            Telefono = Telefono.Trim(),
            Direccion = Direccion.Trim(),
            Ciudad = Ciudad.Trim(),
            Provincia = Provincia.Trim(),
            CodigoPostal = CodigoPostal?.Trim() ?? string.Empty,
            Referencia = Referencia?.Trim() ?? string.Empty,
            MetodoPago = MetodoPago,
            CuponCodigo = string.IsNullOrWhiteSpace(CuponCodigo) ? null : CuponCodigo.Trim(),
            UsuarioId = null, // compra como invitado (o se podría tomar del usuario logueado)
            Items = Items.Select(i => new CrearPedidoItem
            {
                RelojId = i.RelojId,
                MovimientoId = i.MovimientoId,
                TipoPulseraId = i.TipoPulseraId,
                Cantidad = i.Cantidad,
            }).ToList(),
        };

        var (pedido, error) = await _pedidos.CrearPedidoAsync(request);
        if (pedido is null)
        {
            Error = error ?? "No se pudo procesar el pedido.";
            return Page();
        }

        // Compra exitosa: se vacía el carrito y se muestra la confirmación.
        _carrito.Vaciar();
        return RedirectToPage("/Confirmacion", new { id = pedido.Id });
    }

    private void Cargar()
    {
        Items = _carrito.ObtenerItems();
        Subtotal = _carrito.Total();
        Itbis = Math.Round(Subtotal * 0.18m, 2, MidpointRounding.AwayFromZero);
    }
}
