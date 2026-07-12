using System.Text.Json.Serialization;

namespace RelojAPI.Models
{
    // Maquina / movimiento del reloj (NH35, NH34, Miyota 8215, etc.)
    public class Movimiento
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;

        // Costo adicional al usar esta maquina
        public decimal PrecioExtra { get; set; }

        // Inventario propio de esta maquina (componente) - modelo BOM / assemble-to-order
        public int Stock { get; set; }

        // Relojes compatibles con esta maquina (many-to-many).
        // Se ignora en JSON para evitar ciclos (el frontend solo lee reloj.movimientosCompatibles).
        [JsonIgnore]
        public ICollection<Reloj> RelojesCompatibles { get; set; } = new List<Reloj>();
    }
}
