using RelojBlazor.Models;

namespace RelojBlazor.Interfaces
{
    public interface IAuthService
    {
        Usuario? UsuarioActual { get; }
        bool EstaLogueado { get; }
        bool EsAdmin { get; }
        event Action? OnCambio;

        Task<(bool Exito, string? Error)> LoginAsync(string email, string password);
        void Logout();

        // Gestión de usuarios (admin)
        Task<IEnumerable<Usuario>> GetUsuariosAsync();
        Task<(bool Exito, string? Error)> CrearUsuarioAsync(string nombre, string apellido, string email, string password, bool esAdmin);
        Task<bool> ToggleAdminAsync(int id, bool esAdmin);
        Task<bool> DesactivarUsuarioAsync(int id);
    }
}
