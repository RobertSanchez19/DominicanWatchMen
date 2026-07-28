using System.Net.Http.Json;
using System.Text.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Servicio de autenticacion: valida credenciales contra el RelojAPI (api/usuario).
    // La sesion (cookie) se establece en la pagina Login; aqui solo se validan datos.
    public class AuthService : IAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IHttpClientFactory httpClientFactory, ILogger<AuthService> logger)
        {
            _httpClient = httpClientFactory.CreateClient("auth-api");
            _logger = logger;
        }

        public async Task<LoginResultado> LoginAsync(string email, string password)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/usuario/login", new { email, password });

                if (!response.IsSuccessStatusCode)
                {
                    var msg = await LeerMensajeError(response);
                    _logger.LogWarning("Login fallido para {Email}: {Msg}", email, msg);
                    return new LoginResultado(false, msg ?? "Correo o contraseña incorrectos");
                }

                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                var root = doc.RootElement;

                // La API puede pedir un segundo paso (2FA) en vez de devolver el usuario.
                if (root.TryGetProperty("requiere2FA", out var req) && req.GetBoolean())
                {
                    var uid = root.GetProperty("usuarioId").GetInt32();
                    string? codigoDemo = root.TryGetProperty("codigoDemo", out var cd) && cd.ValueKind == JsonValueKind.String
                        ? cd.GetString() : null;
                    _logger.LogInformation("Login paso 1 (2FA) para usuario {Id}", uid);
                    return new LoginResultado(true, null, Requiere2FA: true, UsuarioId: uid, CodigoDemo: codigoDemo);
                }

                var usuario = root.Deserialize<Usuario>(JsonOpts());
                _logger.LogInformation("Login exitoso: {Nombre} (Rol={Rol})", usuario?.Nombre, usuario?.Rol);
                return new LoginResultado(true, null, Usuario: usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error de conexion durante login");
                return new LoginResultado(false, "No se pudo conectar con el servidor. Verifica que RelojAPI esté corriendo.");
            }
        }

        public async Task<LoginResultado> Verificar2FAAsync(int usuarioId, string codigo)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/usuario/verificar-2fa",
                    new { usuarioId, codigo });

                if (!response.IsSuccessStatusCode)
                {
                    var msg = await LeerMensajeError(response);
                    return new LoginResultado(false, msg ?? "Código inválido o expirado");
                }

                var usuario = await response.Content.ReadFromJsonAsync<Usuario>(JsonOpts());
                return new LoginResultado(true, null, Usuario: usuario);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar 2FA");
                return new LoginResultado(false, "No se pudo conectar con el servidor.");
            }
        }

        public async Task<(bool Exito, string? Error)> RegistrarAsync(string nombre, string apellido, string email, string password, string? telefono, string? direccion)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/usuario/registro",
                    new { nombre, apellido, email, password, telefono, direccion });

                if (!response.IsSuccessStatusCode)
                {
                    var msg = await LeerMensajeError(response);
                    return (false, msg ?? "No se pudo registrar la cuenta");
                }
                return (true, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al registrar usuario");
                return (false, "No se pudo conectar con el servidor.");
            }
        }

        public async Task<(bool Enviado, string? EnlaceDemo, string Mensaje)> RecuperarAsync(string email)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/usuario/recuperar", new { email });
                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                var root = doc.RootElement;

                var enviado = root.TryGetProperty("enviado", out var e) && e.ValueKind == JsonValueKind.True;
                string? enlaceDemo = root.TryGetProperty("enlaceDemo", out var ed) && ed.ValueKind == JsonValueKind.String
                    ? ed.GetString() : null;

                // Por seguridad el mensaje es siempre el mismo (no revela si el correo existe).
                var mensaje = enviado
                    ? "Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo."
                    : "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";
                return (enviado, enlaceDemo, mensaje);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al solicitar recuperación de contraseña");
                return (false, null, "No se pudo conectar con el servidor.");
            }
        }

        public async Task<(bool Exito, string? Error)> RestablecerAsync(string token, string nuevaPassword)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("api/usuario/restablecer",
                    new { token, nuevaPassword });

                if (!response.IsSuccessStatusCode)
                {
                    var msg = await LeerMensajeError(response);
                    return (false, msg ?? "El enlace es inválido o ya expiró.");
                }
                return (true, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al restablecer contraseña");
                return (false, "No se pudo conectar con el servidor.");
            }
        }

        public async Task<IEnumerable<Usuario>> GetUsuariosAsync()
        {
            var result = await _httpClient.GetFromJsonAsync<IEnumerable<Usuario>>("api/usuario", JsonOpts());
            return result ?? Enumerable.Empty<Usuario>();
        }

        public async Task<bool> CambiarRolAsync(int id, string rol)
        {
            _logger.LogInformation("Cambiando rol de usuario {Id} a {Rol}", id, rol);
            var response = await _httpClient.PutAsJsonAsync($"api/usuario/{id}/rol", new { rol });
            return response.IsSuccessStatusCode;
        }

        public async Task<bool> DesactivarUsuarioAsync(int id)
        {
            _logger.LogInformation("Desactivando usuario {Id}", id);
            var response = await _httpClient.DeleteAsync($"api/usuario/{id}");
            return response.IsSuccessStatusCode;
        }

        private static JsonSerializerOptions JsonOpts() =>
            new(JsonSerializerDefaults.Web) { PropertyNameCaseInsensitive = true };

        private static async Task<string?> LeerMensajeError(HttpResponseMessage response)
        {
            try
            {
                using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                if (doc.RootElement.TryGetProperty("mensaje", out var m)) return m.GetString();
            }
            catch { /* respuesta sin cuerpo JSON */ }
            return null;
        }
    }
}
