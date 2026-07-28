namespace RelojRazor.Models
{
    // Refleja el UsuarioDto que devuelve el RelojAPI al iniciar sesion.
    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool EsAdmin { get; set; }
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
        public string Rol { get; set; } = "Cliente";
        public bool DobleFactor { get; set; }

        // Solo lo usa la pantalla de gestion de usuarios (admin)
        public bool Activo { get; set; } = true;
    }
}
