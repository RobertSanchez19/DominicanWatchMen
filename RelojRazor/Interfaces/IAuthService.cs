using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Resultado de un intento de login contra el Web API.
    public record LoginResultado(
        bool Exito,
        string? Error,
        bool Requiere2FA = false,
        int UsuarioId = 0,
        Usuario? Usuario = null,
        string? CodigoDemo = null);

    // Contrato del servicio de autenticacion y gestion de usuarios.
    // Habla con el RelojAPI (api/usuario). Se consume por inyeccion de dependencias.
    public interface IAuthService
    {
        Task<LoginResultado> LoginAsync(string email, string password);
        Task<LoginResultado> Verificar2FAAsync(int usuarioId, string codigo);
        Task<(bool Exito, string? Error)> RegistrarAsync(string nombre, string apellido, string email, string password, string? telefono, string? direccion);

        // Recuperacion de contraseña (usa los endpoints recuperar/restablecer del API).
        // EnlaceDemo trae el enlace listo cuando no hay correo configurado (modo demo).
        Task<(bool Enviado, string? EnlaceDemo, string Mensaje)> RecuperarAsync(string email);
        Task<(bool Exito, string? Error)> RestablecerAsync(string token, string nuevaPassword);

        // Gestion (solo admin)
        Task<IEnumerable<Usuario>> GetUsuariosAsync();
        Task<bool> CambiarRolAsync(int id, string rol);
        Task<bool> DesactivarUsuarioAsync(int id);
    }
}
