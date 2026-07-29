namespace RelojRazor.Models
{
    // Pedido (orden de compra) que devuelve el RelojAPI (api/pedido).
    public class Pedido
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }

        public string NombreCliente { get; set; } = string.Empty;
        public string ApellidoCliente { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;

        public string Direccion { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Provincia { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;

        public string MetodoPago { get; set; } = string.Empty;

        public decimal Subtotal { get; set; }
        public decimal Descuento { get; set; }
        public string? CuponCodigo { get; set; }
        public decimal Itbis { get; set; }
        public decimal Envio { get; set; }
        public decimal Total { get; set; }

        public string Estado { get; set; } = string.Empty;
        public int? UsuarioId { get; set; }

        public List<PedidoItem> Items { get; set; } = new();
    }

    public class PedidoItem
    {
        public int RelojId { get; set; }
        public string RelojNombre { get; set; } = string.Empty;
        public string MaquinaNombre { get; set; } = string.Empty;
        public string PulseraNombre { get; set; } = string.Empty;
        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }

    // Lo que se envía al API para crear un pedido (el servidor recalcula precios y valida stock).
    public class CrearPedidoRequest
    {
        public string NombreCliente { get; set; } = string.Empty;
        public string ApellidoCliente { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Provincia { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string MetodoPago { get; set; } = string.Empty;
        public string? CuponCodigo { get; set; }
        public int? UsuarioId { get; set; }
        public List<CrearPedidoItem> Items { get; set; } = new();
    }

    public class CrearPedidoItem
    {
        public int RelojId { get; set; }
        public int MovimientoId { get; set; }
        public int TipoPulseraId { get; set; }
        public int Cantidad { get; set; }
    }
}
