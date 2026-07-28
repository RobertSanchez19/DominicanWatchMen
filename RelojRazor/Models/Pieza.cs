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

        // Opcionales: si se dejan vacíos, el servicio los envía como cadena vacía al API.
        public string? Tipo { get; set; }
        public string? Color { get; set; }
        public string? Material { get; set; }

        [Range(0, 100000, ErrorMessage = "El stock no puede ser negativo")]
        public int Stock { get; set; }

        public string? ImagenUrl { get; set; }
    }
}
