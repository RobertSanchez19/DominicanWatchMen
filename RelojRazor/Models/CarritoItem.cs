namespace RelojRazor.Models
{
    // Una linea del carrito: un reloj ya configurado (maquina + pulsera) con su cantidad.
    // Se guarda en la sesion del usuario (no en el API) porque es una seleccion temporal.
    public class CarritoItem
    {
        public int RelojId { get; set; }
        public string RelojNombre { get; set; } = string.Empty;
        public string? ImagenUrl { get; set; }

        public int MovimientoId { get; set; }
        public string Maquina { get; set; } = string.Empty;

        public int TipoPulseraId { get; set; }
        public string Pulsera { get; set; } = string.Empty;

        // Precio unitario ya calculado (base + extra maquina + extra pulsera).
        public decimal PrecioUnitario { get; set; }
        public int Cantidad { get; set; }

        // Total de esta linea.
        public decimal Subtotal => PrecioUnitario * Cantidad;

        // Clave que identifica una configuracion concreta: mismo reloj + maquina + pulsera
        // se agrupan sumando cantidad, en lugar de crear lineas repetidas.
        public string Clave => $"{RelojId}-{MovimientoId}-{TipoPulseraId}";
    }
}
