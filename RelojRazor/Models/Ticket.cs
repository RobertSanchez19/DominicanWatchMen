namespace RelojRazor.Models
{
    // Ticket de soporte que expone el RelojAPI (api/ticket).
    public class Ticket
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public int? PedidoId { get; set; }
        public string Asunto { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }

        public string Prioridad { get; set; } = "Media";   // Baja, Media, Alta
        public string Estado { get; set; } = "Abierto";     // Abierto, En progreso, Resuelto, Cerrado
        public DateTime Fecha { get; set; }

        public List<TicketMensaje> Mensajes { get; set; } = new();
    }

    // Mensaje dentro del hilo de un ticket (cliente <-> soporte).
    public class TicketMensaje
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string Autor { get; set; } = string.Empty;
        public bool EsSoporte { get; set; }
        public string Texto { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
        public DateTime Fecha { get; set; }
    }
}
