namespace RelojRazor.Models
{
    // Modelo de Marca: refleja la entidad que expone el RelojAPI (api/marca)
    public class Marca
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string PaisOrigen { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public List<Reloj> Relojes { get; set; } = new();
    }
}
