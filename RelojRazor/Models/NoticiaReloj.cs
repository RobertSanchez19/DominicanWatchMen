namespace RelojRazor.Models
{
    // Una noticia de relojería traída de un servicio externo (NewsAPI).
    public class NoticiaReloj
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }
        public string? Fuente { get; set; }
        public DateTime? Fecha { get; set; }
    }
}
