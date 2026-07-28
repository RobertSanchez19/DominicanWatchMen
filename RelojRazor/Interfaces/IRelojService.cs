using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato de la capa de servicios que habla con el RelojAPI.
    // Se consume por inyeccion de dependencias en las Razor Pages.
    public interface IRelojService
    {
        // Relojes
        Task<IEnumerable<Reloj>> GetAllAsync();
        Task<Reloj?> GetByIdAsync(int id);
        Task<Reloj> CreateRelojAsync(Reloj reloj);
        Task<Reloj?> UpdateRelojAsync(int id, Reloj reloj);
        Task<bool> DeleteRelojAsync(int id);

        // Marcas
        Task<IEnumerable<Marca>> GetMarcasAsync();
        Task<Marca?> CreateMarcaAsync(Marca marca);
        Task<bool> DeleteMarcaAsync(int id);
    }
}
