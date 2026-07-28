namespace RelojRazor.Models
{
    // Configuracion editable del sitio (branding, portada y pie de pagina).
    // El RelojAPI la expone en api/configuracion.
    public class SiteConfig
    {
        public int Id { get; set; }

        // Encabezado / branding
        public string SitioNombre { get; set; } = "Dominican Watch Men";
        public string SitioSubtitulo { get; set; } = "RD · Alta Relojería";
        public string? LogoUrl { get; set; }

        // Portada (Landing / Hero)
        public string HeroTitulo { get; set; } = "No vendemos relojes. Ensamblamos tiempo.";
        public string HeroSubtitulo { get; set; } = "Movimientos Seiko originales. Componentes de grado quirúrgico. Diseños únicos con alma clásica.";

        // Pie de pagina
        public string FooterTagline { get; set; } = "Alta Relojería · Santo Domingo, RD";
        public string FooterCopyright { get; set; } = "Dominican Watch Men · Todos los derechos reservados";
    }
}
