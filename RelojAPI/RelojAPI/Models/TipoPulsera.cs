using System.Text.Json.Serialization;

namespace RelojAPI.Models
{
    // Tipo de pulsera / correa (Oyster, Jubilee, NATO, Tropic, Cuero, etc.)
    public class TipoPulsera
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Material: Metal, Caucho, Nylon, Cuero
        public string Material { get; set; } = string.Empty;

        // Costo adicional al usar esta pulsera
        public decimal PrecioExtra { get; set; }

        // Inventario propio de esta pulsera (componente) - modelo BOM / assemble-to-order
        public int Stock { get; set; }

        // Relojes compatibles con esta pulsera (many-to-many).
        // Se ignora en JSON para evitar ciclos (el frontend solo lee reloj.pulserasCompatibles).
        [JsonIgnore]
        public ICollection<Reloj> RelojesCompatibles { get; set; } = new List<Reloj>();
    }
}
