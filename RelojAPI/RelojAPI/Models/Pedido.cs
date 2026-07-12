namespace RelojAPI.Models
{
    // Pedido (orden de compra) generado en el checkout
    public class Pedido
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        // Datos del cliente
        public string NombreCliente { get; set; } = string.Empty;
        public string ApellidoCliente { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;

        // Direccion de envio
        public string Direccion { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Provincia { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;

        public string MetodoPago { get; set; } = string.Empty;
        public decimal Total { get; set; }
        public string Estado { get; set; } = "Pendiente";

        // Usuario que compro (opcional; null si fue como invitado)
        public int? UsuarioId { get; set; }

        public ICollection<PedidoItem> Items { get; set; } = new List<PedidoItem>();
    }
}
