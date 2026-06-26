using RelojAPI.Models;

namespace RelojAPI.Interfaces
{
    // Interface creada por nosotros - implementada via Inyeccion de Dependencias (DI)
    public interface IRelojService
    {
        Task<IEnumerable<Reloj>> GetAllAsync();
        Task<Reloj?> GetByIdAsync(int id);
        Task<Reloj> CreateAsync(Reloj reloj);
        Task<Reloj?> UpdateAsync(int id, Reloj reloj);
        Task<bool> DeleteAsync(int id);
    }
}
