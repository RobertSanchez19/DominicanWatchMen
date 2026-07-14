using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;
using RelojAPI.Services;
using System.Security.Cryptography;
using System.Text;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsuarioController> _logger;
        private readonly IEmailService _email;
        private readonly IConfiguration _cfg;

        public UsuarioController(AppDbContext context, ILogger<UsuarioController> logger, IEmailService email, IConfiguration cfg)
        {
            _context = context;
            _logger = logger;
            _email = email;
            _cfg = cfg;
        }

        private static string GenerarCodigo() => Random.Shared.Next(100000, 999999).ToString();

        // Requisitos minimos de contraseña: 8+ caracteres, con mayuscula, minuscula y numero
        private static bool PasswordValida(string? p, out string error)
        {
            error = "";
            if (string.IsNullOrWhiteSpace(p) || p.Length < 8) { error = "La contraseña debe tener al menos 8 caracteres"; return false; }
            if (!p.Any(char.IsUpper)) { error = "La contraseña debe incluir al menos una letra mayúscula"; return false; }
            if (!p.Any(char.IsLower)) { error = "La contraseña debe incluir al menos una letra minúscula"; return false; }
            if (!p.Any(char.IsDigit)) { error = "La contraseña debe incluir al menos un número"; return false; }
            return true;
        }

        // POST: api/usuario (admin: crea usuario con rol personalizable)
        [HttpPost]
        public async Task<ActionResult> CrearAdmin([FromBody] CrearUsuarioDto dto)
        {
            _logger.LogInformation("POST /api/usuario - Creando usuario admin: {Email}", dto.Email);

            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { mensaje = "Ya existe una cuenta con ese correo electrónico" });

            if (!PasswordValida(dto.Password, out var errorPwd))
                return BadRequest(new { mensaje = errorPwd });

            var usuario = new Usuario
            {
                Nombre       = dto.Nombre,
                Apellido     = dto.Apellido,
                Email        = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                EsAdmin      = dto.EsAdmin,
                Rol          = dto.EsAdmin ? "Admin" : "Cliente",
                Activo       = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Usuario creado con Id {Id}, EsAdmin={EsAdmin}", usuario.Id, usuario.EsAdmin);
            return Ok(new UsuarioAdminDto(usuario.Id, usuario.Nombre, usuario.Apellido, usuario.Email, usuario.EsAdmin, usuario.Activo, usuario.FechaRegistro, usuario.Rol));
        }

        // POST: api/usuario/registro
        [HttpPost("registro")]
        public async Task<ActionResult> Registro([FromBody] RegistroDto dto)
        {
            _logger.LogInformation("POST /api/usuario/registro - Email: {Email}", dto.Email);

            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { mensaje = "Ya existe una cuenta con ese correo electrónico" });

            if (!PasswordValida(dto.Password, out var errorPwd))
                return BadRequest(new { mensaje = errorPwd });

            var usuario = new Usuario
            {
                Nombre       = dto.Nombre,
                Apellido     = dto.Apellido,
                Email        = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                Telefono     = dto.Telefono,
                Direccion    = dto.Direccion,
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Usuario registrado con Id {Id}", usuario.Id);
            return Ok(new UsuarioDto(usuario));
        }

        // GET: api/usuario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioAdminDto>>> GetAll()
        {
            _logger.LogInformation("GET /api/usuario - Listando todos los usuarios");
            var usuarios = await _context.Usuarios
                .OrderByDescending(u => u.EsAdmin)
                .ThenBy(u => u.Nombre)
                .Select(u => new UsuarioAdminDto(u.Id, u.Nombre, u.Apellido, u.Email, u.EsAdmin, u.Activo, u.FechaRegistro, u.Rol))
                .ToListAsync();
            return Ok(usuarios);
        }

        // PUT: api/usuario/{id}/rol
        [HttpPut("{id}/rol")]
        public async Task<ActionResult> CambiarRol(int id, [FromBody] CambiarRolDto dto)
        {
            _logger.LogInformation("PUT /api/usuario/{Id}/rol - Rol={Rol}", id, dto.Rol);
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });
            usuario.Rol = dto.Rol;
            usuario.EsAdmin = dto.Rol == "Admin"; // se mantiene sincronizado con el rol
            await _context.SaveChangesAsync();
            return Ok(new UsuarioAdminDto(usuario.Id, usuario.Nombre, usuario.Apellido, usuario.Email, usuario.EsAdmin, usuario.Activo, usuario.FechaRegistro, usuario.Rol));
        }

        // DELETE: api/usuario/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Desactivar(int id)
        {
            _logger.LogInformation("DELETE /api/usuario/{Id} - Desactivando usuario", id);
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });
            usuario.Activo = false;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/usuario/{id}  (el cliente actualiza su propio perfil)
        [HttpPut("{id}")]
        public async Task<ActionResult> ActualizarPerfil(int id, [FromBody] ActualizarPerfilDto dto)
        {
            _logger.LogInformation("PUT /api/usuario/{Id} - Actualizando perfil", id);
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });

            usuario.Nombre    = dto.Nombre;
            usuario.Apellido  = dto.Apellido;
            usuario.Telefono  = dto.Telefono;
            usuario.Direccion = dto.Direccion;
            usuario.DobleFactor = dto.DobleFactor;
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                // Para cambiar la contrasena se exige la actual correcta
                if (usuario.PasswordHash != HashPassword(dto.PasswordActual ?? ""))
                    return BadRequest(new { mensaje = "La contraseña actual es incorrecta" });
                if (!PasswordValida(dto.Password, out var errorPwd))
                    return BadRequest(new { mensaje = errorPwd });
                usuario.PasswordHash = HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(new UsuarioDto(usuario));
        }

        // POST: api/usuario/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto dto)
        {
            _logger.LogInformation("POST /api/usuario/login - Email: {Email}", dto.Email);

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

            if (usuario == null || usuario.PasswordHash != HashPassword(dto.Password))
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });

            // Verificacion en dos pasos: solo si el usuario la tiene activada
            if (usuario.DobleFactor)
            {
                var codigo = GenerarCodigo();
                usuario.Codigo = codigo;
                usuario.CodigoExpira = DateTime.UtcNow.AddMinutes(10);
                await _context.SaveChangesAsync();
                var enviado = await _email.EnviarAsync(usuario.Email, "Tu codigo de acceso - Dominican Watch Men",
                    $"Tu codigo de verificacion es: {codigo}. Valido por 10 minutos.");
                _logger.LogInformation("Login paso 1 (2FA) para usuario Id {Id}", usuario.Id);
                return Ok(new { requiere2FA = true, usuarioId = usuario.Id, demo = !enviado, codigoDemo = enviado ? null : codigo });
            }

            _logger.LogInformation("Login exitoso para usuario Id {Id}", usuario.Id);
            return Ok(new UsuarioDto(usuario));
        }

        // POST: api/usuario/verificar-2fa  (completa el login con el codigo)
        [HttpPost("verificar-2fa")]
        public async Task<ActionResult> Verificar2FA([FromBody] Verificar2FADto dto)
        {
            var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });
            if (usuario.Codigo != dto.Codigo || usuario.CodigoExpira < DateTime.UtcNow)
                return BadRequest(new { mensaje = "Codigo invalido o expirado" });
            usuario.Codigo = null; usuario.CodigoExpira = null;
            await _context.SaveChangesAsync();
            return Ok(new UsuarioDto(usuario));
        }

        // POST: api/usuario/recuperar  (envia un enlace para restablecer la contraseña)
        [HttpPost("recuperar")]
        public async Task<ActionResult> Recuperar([FromBody] RecuperarDto dto)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);
            if (usuario == null)
                return Ok(new { enviado = false, demo = true, mensaje = "Si el correo existe, se envio un enlace." });

            var token = Guid.NewGuid().ToString("N");
            usuario.ResetToken = token;
            usuario.ResetTokenExpira = DateTime.UtcNow.AddMinutes(30);
            await _context.SaveChangesAsync();

            var baseUrl = (_cfg["Frontend:BaseUrl"] ?? "http://localhost:8080").TrimEnd('/');
            var enlace = $"{baseUrl}/#/restablecer/{token}";
            var cuerpo = $"Hola {usuario.Nombre},\n\nRecibimos una solicitud para restablecer tu contraseña. " +
                         $"Haz clic en el siguiente enlace para crear una nueva (valido por 30 minutos):\n\n{enlace}\n\n" +
                         "Si no fuiste tu, ignora este correo.\n\nDominican Watch Men";
            var enviado = await _email.EnviarAsync(usuario.Email, "Restablecer contraseña - Dominican Watch Men", cuerpo);
            // En modo demo (sin correo configurado) devolvemos el enlace para poder probar
            return Ok(new { enviado, demo = !enviado, enlaceDemo = enviado ? null : enlace });
        }

        // POST: api/usuario/restablecer  (con el token del enlace, define la nueva contraseña)
        [HttpPost("restablecer")]
        public async Task<ActionResult> Restablecer([FromBody] RestablecerDto dto)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.ResetToken == dto.Token);
            if (usuario == null || string.IsNullOrWhiteSpace(dto.Token) || usuario.ResetTokenExpira < DateTime.UtcNow)
                return BadRequest(new { mensaje = "El enlace es invalido o ya expiro. Solicita uno nuevo." });
            if (!PasswordValida(dto.NuevaPassword, out var errorPwd))
                return BadRequest(new { mensaje = errorPwd });

            usuario.PasswordHash = HashPassword(dto.NuevaPassword);
            usuario.ResetToken = null; usuario.ResetTokenExpira = null;
            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "Contraseña restablecida correctamente" });
        }

        private static string HashPassword(string password)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
            return Convert.ToHexString(bytes).ToLower();
        }
    }

    // DTOs para no exponer el modelo completo
    public record RegistroDto(
        string Nombre, string Apellido, string Email, string Password,
        string? Telefono, string? Direccion);

    public record LoginDto(string Email, string Password);

    public record UsuarioDto(int Id, string Nombre, string Apellido, string Email, bool EsAdmin, string? Telefono, string? Direccion, string Rol, bool DobleFactor)
    {
        public UsuarioDto(Usuario u) : this(u.Id, u.Nombre, u.Apellido, u.Email, u.EsAdmin, u.Telefono, u.Direccion, u.Rol, u.DobleFactor) { }
    }

    public record ActualizarPerfilDto(string Nombre, string Apellido, string? Telefono, string? Direccion, string? Password, string? PasswordActual, bool DobleFactor);
    public record Verificar2FADto(int UsuarioId, string Codigo);
    public record RecuperarDto(string Email);
    public record RestablecerDto(string Token, string NuevaPassword);

    public record UsuarioAdminDto(int Id, string Nombre, string Apellido, string Email, bool EsAdmin, bool Activo, DateTime FechaRegistro, string Rol);

    public record CambiarRolDto(string Rol);
    public record CrearUsuarioDto(string Nombre, string Apellido, string Email, string Password, bool EsAdmin);
}
