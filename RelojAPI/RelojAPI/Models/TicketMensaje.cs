using System.Text.Json.Serialization;

namespace RelojAPI.Models
{
    // Mensaje dentro del hilo de un ticket (cliente <-> soporte)
    public class TicketMensaje
    {
        public int Id { get; set; }

        public int TicketId { get; set; }
        [JsonIgnore]
        public Ticket? Ticket { get; set; }

        public string Autor { get; set; } = string.Empty;
        public bool EsSoporte { get; set; }
        public string Texto { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
        public DateTime Fecha { get; set; } = DateTime.UtcNow;
    }
}
