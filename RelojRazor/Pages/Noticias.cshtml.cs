using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Página automática de noticias de relojería: trae los titulares de un servicio
// externo (NewsAPI) a través de INoticiasService y los muestra en tarjetas.
public class NoticiasModel : PageModel
{
    private readonly INoticiasService _noticias;

    public NoticiasModel(INoticiasService noticias) => _noticias = noticias;

    public IReadOnlyList<NoticiaReloj> Noticias { get; private set; } = new List<NoticiaReloj>();
    public string? Error { get; private set; }

    public async Task OnGetAsync()
    {
        var r = await _noticias.ObtenerAsync();
        Noticias = r.Noticias;
        Error = r.Error;
    }
}
