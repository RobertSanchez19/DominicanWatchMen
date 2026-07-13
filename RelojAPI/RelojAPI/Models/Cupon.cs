namespace RelojAPI.Models
{
    // Cupon de descuento aplicable en el checkout
    public class Cupon
    {
        public int Id { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Tipo { get; set; } = "porcentaje"; // "porcentaje" o "monto"
        public decimal Valor { get; set; }
        public bool Activo { get; set; } = true;
    }
}
