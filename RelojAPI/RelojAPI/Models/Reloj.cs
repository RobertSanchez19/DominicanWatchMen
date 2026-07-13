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

        // Indica si el reloj se muestra como principal en la portada (Home)
        public bool Destacado { get; set; }

        // Tipo de modelo para sugerir pulseras: Diver, GMT, Dress, Field
        public string TipoModelo { get; set; } = string.Empty;

        // Llave foranea hacia Marca
        public int MarcaId { get; set; }
        public Marca? Marca { get; set; }

        // Componentes compatibles con este reloj (many-to-many, INDEPENDIENTES entre si).
        // El inventario NO vive aqui: cada componente (maquina/pulsera) tiene su propio Stock.
        public ICollection<Movimiento> MovimientosCompatibles { get; set; } = new List<Movimiento>();
        public ICollection<TipoPulsera> PulserasCompatibles { get; set; } = new List<TipoPulsera>();

        // Reseñas / valoraciones de clientes
        public ICollection<Resena> Resenas { get; set; } = new List<Resena>();
    }
}
