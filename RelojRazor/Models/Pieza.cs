using System.ComponentModel.DataAnnotations;

namespace RelojRazor.Models
{
    // Pieza del inventario de TALLER (fabricación) que expone el RelojAPI (api/pieza).
    // Categorías: Pulsera, Maquina, Dial, Case, Bezel, Aguja.
    public class Pieza
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "La categoría es obligatoria")]
        public string Categoria { get; set; } = string.Empty;

        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = string.Empty;

        public string Tipo { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Material { get; set; } = string.Empty;

        [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }

        public string? ImagenUrl { get; set; }
    }
}
