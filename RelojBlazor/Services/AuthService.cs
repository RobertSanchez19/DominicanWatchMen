using System.Net.Http.Json;
using RelojBlazor.Interfaces;
using RelojBlazor.Models;

namespace RelojBlazor.Services
{
    public class AuthService : IAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AuthService> _logger;
        private readonly IConfiguration _configuration;

        public Usuario? UsuarioActual { get; private set; }
        public bool EstaLogueado => UsuarioActual != null;
        public bool EsAdmin => UsuarioActual?.EsAdmin ?? false;
        public event Action? OnCambio;

        public AuthService(IHttpClientFactory httpClientFactory, ILogger<AuthService> logger, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient("auth-api");
            _logger = logger;
            _configuration = configuration;
        }

        public async Task<(bool Exito, string? Error)> LoginAsync(string email, string password)
        {
            try
            {
                var apiNombre = _configuration["ApiSettings:Nombre"] ?? "RelojAPI";
                _logger.LogInformation("Intento de login en {Api} para {Email}", apiNombre, email);

                var response = await _httpClient.PostAsJsonAsync("api/usuario/login",
                    new { email, password });

                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadFromJsonAsync<ErrorMensaje>();
                    _logger.LogWarning("Login fallido para {Email}: {Msg}", email, err?.Mensaje);
                    return (false, err?.Mensaje ?? "Correo o contraseña incorrectos");
                }

                UsuarioActual = await response.Content.ReadFromJsonAsync<Usuario>();
                _logger.LogInformation("Login exitoso: {Nombre} (Admin={EsAdmin})",
                    UsuarioActual?.Nombre, UsuarioActual?.EsAdmin);

                OnCambio?.Invoke();
                return (true, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error de conexión durante login");
                return (false, "No se pudo conectar con el servidor. Verifica que RelojAPI esté corriendo.");
            }
        }

        public void Logout()
        {
            _logger.LogInformation("Logout: {Nombre}", UsuarioActual?.Nombre);
            UsuarioActual = null;
            OnCambio?.Invoke();
        }

        // ── Gestión de usuarios ────────────────────────────────────────────────

        public async Task<(bool Exito, string? Error)> CrearUsuarioAsync(string nombre, string apellido, string email, string password, bool esAdmin)
        {
            try
            {
                _logger.LogInformation("Creando usuario {Email}, EsAdmin={EsAdmin}", email, esAdmin);
                var response = await _httpClient.PostAsJsonAsync("api/usuario",
                    new { nombre, apellido, email, password, esAdmin });

                if (!response.IsSuccessStatusCode)
                {
                    var err = await response.Content.ReadFromJsonAsync<ErrorMensaje>();
                    return (false, err?.Mensaje ?? "No se pudo crear el usuario");
                }
                return (true, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear usuario");
                return (false, "Error de conexión con el servidor.");
            }
        }

        public async Task<IEnumerable<Usuario>> GetUsuariosAsync()
        {
            _logger.LogInformation("Obteniendo lista de usuarios");
            var result = await _httpClient.GetFromJsonAsync<IEnumerable<Usuario>>("api/usuario");
            return result ?? Enumerable.Empty<Usuario>();
        }

        public async Task<bool> ToggleAdminAsync(int id, bool esAdmin)
        {
            _logger.LogInformation("Cambiando rol usuario {Id} → EsAdmin={EsAdmin}", id, esAdmin);
            var response = await _httpClient.PutAsJsonAsync($"api/usuario/{id}/rol", new { esAdmin });
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DesactivarUsuarioAsync(int id)
        {
            _logger.LogInformation("Desactivando usuario {Id}", id);
            var response = await _httpClient.DeleteAsync($"api/usuario/{id}");
            return response.IsSuccessStatusCode;
        }

        private record ErrorMensaje(string Mensaje);
    }
}
