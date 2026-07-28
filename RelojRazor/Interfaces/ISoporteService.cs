using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato del servicio de soporte (tickets). Habla con api/ticket.
    public interface ISoporteService
    {
        Task<IEnumerable<Ticket>> GetTicketsAsync(string? estado = null);
        Task<Ticket?> GetTicketAsync(int id);
        Task<bool> ResponderAsync(int ticketId, string autor, string texto);
        Task<bool> CambiarEstadoAsync(int ticketId, string estado);
    }
}
