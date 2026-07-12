namespace RelojAPI.Models
{
    // Tarjeta guardada del cliente. Por seguridad SOLO se guardan datos enmascarados:
    // marca, ultimos 4 digitos, vencimiento y titular. NUNCA el numero completo ni el CVV.
    public class TarjetaGuardada
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Marca { get; set; } = string.Empty;
        public string Ultimos4 { get; set; } = string.Empty;
        public string Vence { get; set; } = string.Empty;
        public string Titular { get; set; } = string.Empty;
    }
}
