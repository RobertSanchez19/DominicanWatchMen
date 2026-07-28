using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato del servicio de noticias de relojería (consume una API externa).
    public interface INoticiasService
    {
        Task<(IReadOnlyList<NoticiaReloj> Noticias, string? Error)> ObtenerAsync();
    }
}
