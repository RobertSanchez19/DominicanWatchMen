namespace RelojRazor.Interfaces
{
    // Datos de una marca traídos de fuentes web gratuitas (Wikipedia + Clearbit).
    public record MarcaEnriquecida(string? Descripcion, string? LogoUrl, string? PaisOrigen, string? Aviso);

    // Autocompleta datos de una marca a partir de su nombre, usando fuentes
    // gratuitas y sin API key (Wikipedia para descripción y logo; favicon de respaldo).
    public interface IMarcaWebService
    {
        Task<MarcaEnriquecida> EnriquecerAsync(string nombre);
    }
}
