namespace RelojAPI.Models
{
    // Pieza del inventario de TALLER (fabricacion). Separado del inventario de venta.
    // Categorias: Pulsera, Maquina, Dial, Case, Bezel, Aguja.
    public class Pieza
    {
        public int Id { get; set; }
        public string Categoria { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string Material { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string? ImagenUrl { get; set; }
    }
}
