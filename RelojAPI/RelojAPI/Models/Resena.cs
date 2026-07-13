using System.Text.Json.Serialization;

namespace RelojAPI.Models
{
    // Resena / valoracion de un reloj por un cliente
    public class Resena
    {
        public int Id { get; set; }

        public int RelojId { get; set; }
        [JsonIgnore]
        public Reloj? Reloj { get; set; }

        public int UsuarioId { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public int Calificacion { get; set; } // 1 a 5 estrellas
        public string Comentario { get; set; } = string.Empty;
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}
