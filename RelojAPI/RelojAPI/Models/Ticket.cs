namespace RelojAPI.Models
{
    // Ticket de soporte / resolucion de problemas con un pedido
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
        public string Estado { get; set; } = "Abierto";    // Abierto, En progreso, Resuelto, Cerrado
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        public ICollection<TicketMensaje> Mensajes { get; set; } = new List<TicketMensaje>();
    }
}
