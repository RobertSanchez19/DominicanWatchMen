using System.Globalization;
using System.Text;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Pagina que lista las marcas retornadas por el Web API.
public class MarcasModel : PageModel
{
    private readonly IRelojService _relojService;
    private readonly ILogger<MarcasModel> _logger;

    public MarcasModel(IRelojService relojService, ILogger<MarcasModel> logger)
    {
        _relojService = relojService;
        _logger = logger;
    }

    // Propiedades pasadas del .cshtml.cs hacia el .cshtml
    public List<Marca> Marcas { get; private set; } = new();
    public string? Error { get; private set; }

    public async Task OnGetAsync()
    {
        try
        {
            Marcas = (await _relojService.GetMarcasAsync()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Marcas: fallo al consultar el Web API");
            Error = "No se pudo conectar con el API. Verifica que el RelojAPI esté corriendo.";
        }
    }

    // Devuelve el logo a mostrar: el guardado en la marca o, si no tiene, el favicon
    // del sitio de la marca (marca.com) via Google. Asi cada marca muestra un logo.
    public static string LogoDe(Marca marca)
    {
        if (!string.IsNullOrWhiteSpace(marca.LogoUrl)) return marca.LogoUrl!;
        var slug = Slug(marca.Nombre);
        return string.IsNullOrEmpty(slug)
            ? ""
            : $"https://www.google.com/s2/favicons?domain={slug}.com&sz=128";
    }

    // "TAG Heuer" -> "tagheuer" (minusculas, sin acentos ni simbolos).
    private static string Slug(string nombre)
    {
        var sinAcentos = new string((nombre ?? "").Normalize(NormalizationForm.FormD)
            .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            .ToArray());
        return new string(sinAcentos.ToLowerInvariant().Where(char.IsLetterOrDigit).ToArray());
    }
}
