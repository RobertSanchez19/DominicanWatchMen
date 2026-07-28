namespace RelojRazor.Models
{
    // Maquina / movimiento del reloj (NH35, NH34, Miyota 8215, etc.).
    // Refleja el componente que expone el RelojAPI dentro de cada reloj
    // (reloj.movimientosCompatibles). Tiene su propio precio extra y stock.
    public class Movimiento
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;

        // Costo adicional al elegir esta maquina.
        public decimal PrecioExtra { get; set; }

        // Inventario propio de la maquina (modelo ensamble-a-pedido).
        public int Stock { get; set; }
    }
}
