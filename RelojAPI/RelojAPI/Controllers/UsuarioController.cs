using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;
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

        public UsuarioController(AppDbContext context, ILogger<UsuarioController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/usuario (admin: crea usuario con rol personalizable)
        [HttpPost]
        public async Task<ActionResult> CrearAdmin([FromBody] CrearUsuarioDto dto)
        {
            _logger.LogInformation("POST /api/usuario - Creando usuario admin: {Email}", dto.Email);

            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { mensaje = "Ya existe una cuenta con ese correo electrónico" });

            var usuario = new Usuario
            {
                Nombre       = dto.Nombre,
                Apellido     = dto.Apellido,
                Email        = dto.Email,
                PasswordHash = HashPassword(dto.Password),
                EsAdmin      = dto.EsAdmin,
                Activo       = true
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Usuario creado con Id {Id}, EsAdmin={EsAdmin}", usuario.Id, usuario.EsAdmin);
            return Ok(new UsuarioAdminDto(usuario.Id, usuario.Nombre, usuario.Apellido, usuario.Email, usuario.EsAdmin, usuario.Activo, usuario.FechaRegistro));
        }

        // POST: api/usuario/registro
        [HttpPost("registro")]
        public async Task<ActionResult> Registro([FromBody] RegistroDto dto)
        {
            _logger.LogInformation("POST /api/usuario/registro - Email: {Email}", dto.Email);

            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
                return BadRequest(new { mensaje = "Ya existe una cuenta con ese correo electrónico" });

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
                .Select(u => new UsuarioAdminDto(u.Id, u.Nombre, u.Apellido, u.Email, u.EsAdmin, u.Activo, u.FechaRegistro))
                .ToListAsync();
            return Ok(usuarios);
        }

        // PUT: api/usuario/{id}/rol
        [HttpPut("{id}/rol")]
        public async Task<ActionResult> CambiarRol(int id, [FromBody] CambiarRolDto dto)
        {
            _logger.LogInformation("PUT /api/usuario/{Id}/rol - EsAdmin={EsAdmin}", id, dto.EsAdmin);
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound(new { mensaje = "Usuario no encontrado" });
            usuario.EsAdmin = dto.EsAdmin;
            await _context.SaveChangesAsync();
            return Ok(new UsuarioAdminDto(usuario.Id, usuario.Nombre, usuario.Apellido, usuario.Email, usuario.EsAdmin, usuario.Activo, usuario.FechaRegistro));
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

        // POST: api/usuario/login
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto dto)
        {
            _logger.LogInformation("POST /api/usuario/login - Email: {Email}", dto.Email);

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

            if (usuario == null || usuario.PasswordHash != HashPassword(dto.Password))
                return Unauthorized(new { mensaje = "Correo o contraseña incorrectos" });

            _logger.LogInformation("Login exitoso para usuario Id {Id}", usuario.Id);
            return Ok(new UsuarioDto(usuario));
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

    public record UsuarioDto(int Id, string Nombre, string Apellido, string Email, bool EsAdmin)
    {
        public UsuarioDto(Usuario u) : this(u.Id, u.Nombre, u.Apellido, u.Email, u.EsAdmin) { }
    }

    public record UsuarioAdminDto(int Id, string Nombre, string Apellido, string Email, bool EsAdmin, bool Activo, DateTime FechaRegistro);

    public record CambiarRolDto(bool EsAdmin);
    public record CrearUsuarioDto(string Nombre, string Apellido, string Email, string Password, bool EsAdmin);
}
