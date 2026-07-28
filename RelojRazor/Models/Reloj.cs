using System.ComponentModel.DataAnnotations;

namespace RelojRazor.Models
{
    // Modelo de Reloj: refleja la entidad que expone el RelojAPI (api/reloj)
    public class Reloj
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El modelo es obligatorio")]
        public string Modelo { get; set; } = string.Empty;

        [Range(0, 9999999, ErrorMessage = "El precio no puede ser negativo")]
        public decimal Precio { get; set; }

        [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }

        public string? ImagenUrl { get; set; }
        public bool Destacado { get; set; }

        // Tipo de modelo (Diver, GMT, Dress, Field) que expone el API.
        public string TipoModelo { get; set; } = string.Empty;

        public int MarcaId { get; set; }
        public Marca? Marca { get; set; }

        // Componentes compatibles que llegan desde el API (many-to-many, independientes).
        // El configurador de la pagina Detalle deja elegir uno de cada uno.
        public List<Movimiento> MovimientosCompatibles { get; set; } = new();
        public List<TipoPulsera> PulserasCompatibles { get; set; } = new();
    }
}
