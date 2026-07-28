namespace RelojRazor.Models
{
    // Tipo de pulsera / correa (Oyster, Jubilee, NATO, Cuero, etc.).
    // Refleja el componente que expone el RelojAPI dentro de cada reloj
    // (reloj.pulserasCompatibles). Tiene su propio precio extra y stock.
    public class TipoPulsera
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;

        // Material: Metal, Caucho, Nylon, Cuero.
        public string Material { get; set; } = string.Empty;

        // Costo adicional al elegir esta pulsera.
        public decimal PrecioExtra { get; set; }

        // Inventario propio de la pulsera (modelo ensamble-a-pedido).
        public int Stock { get; set; }
    }
}
