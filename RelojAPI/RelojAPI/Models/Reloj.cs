namespace RelojAPI.Models
{
    public class Reloj
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string? ImagenUrl { get; set; }

        // Llave foranea hacia Marca
        public int MarcaId { get; set; }
        public Marca? Marca { get; set; }
    }
}
