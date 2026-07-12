using System.Text.Json.Serialization;

namespace RelojAPI.Models
{
    // Linea de un pedido: guarda una "foto" (snapshot) del reloj configurado y su precio,
    // para que el pedido no cambie si luego cambian los productos.
    public class PedidoItem
    {
        public int Id { get; set; }

        public int PedidoId { get; set; }
        [JsonIgnore]
        public Pedido? Pedido { get; set; }

        public int RelojId { get; set; }
        public string RelojNombre { get; set; } = string.Empty;

        public int MovimientoId { get; set; }
        public string MaquinaNombre { get; set; } = string.Empty;

        public int TipoPulseraId { get; set; }
        public string PulseraNombre { get; set; } = string.Empty;

        public int Cantidad { get; set; }
        public decimal PrecioUnitario { get; set; }
        public decimal Subtotal { get; set; }
    }
}
