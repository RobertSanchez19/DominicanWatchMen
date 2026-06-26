using RelojBlazor.Models;

namespace RelojBlazor.Interfaces
{
    public interface IRelojService
    {
        // Relojes — lectura
        Task<IEnumerable<Reloj>> GetAllAsync();

        // Relojes — CRUD admin
        Task<Reloj> CreateRelojAsync(Reloj reloj);
        Task<Reloj?> UpdateRelojAsync(int id, Reloj reloj);
        Task<bool> DeleteRelojAsync(int id);

        // Upload imagen
        Task<string?> UploadImageAsync(Stream fileStream, string fileName, string contentType);

        // Marcas — lectura
        Task<IEnumerable<Marca>> GetMarcasAsync();

        // Marcas — CRUD admin
        Task<Marca> CreateMarcaAsync(Marca marca);
        Task<Marca?> UpdateMarcaAsync(int id, Marca marca);
        Task<bool> DeleteMarcaAsync(int id);
    }
}
