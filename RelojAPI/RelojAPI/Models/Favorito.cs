namespace RelojAPI.Models
{
    // Favorito / wishlist: un usuario marca un reloj como favorito
    public class Favorito
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public int RelojId { get; set; }
    }
}
