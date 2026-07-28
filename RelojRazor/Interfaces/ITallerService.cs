using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato del servicio de taller (piezas de fabricación). Habla con api/pieza.
    public interface ITallerService
    {
        Task<IEnumerable<Pieza>> GetPiezasAsync();
        Task<Pieza?> CreatePiezaAsync(Pieza pieza);
        Task<bool> DeletePiezaAsync(int id);
    }
}
