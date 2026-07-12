using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TarjetaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TarjetaController> _logger;

        public TarjetaController(AppDbContext context, ILogger<TarjetaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/tarjeta?usuarioId=5  -> tarjetas guardadas de un usuario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TarjetaGuardada>>> GetAll([FromQuery] int usuarioId)
        {
            var tarjetas = await _context.Tarjetas.Where(t => t.UsuarioId == usuarioId).ToListAsync();
            return Ok(tarjetas);
        }

        // POST: api/tarjeta  -> guarda una tarjeta (solo datos enmascarados)
        [HttpPost]
        public async Task<ActionResult<TarjetaGuardada>> Create([FromBody] TarjetaGuardada tarjeta)
        {
            // Seguridad: solo conservamos los ultimos 4 digitos (por si llegara algo mas largo)
            tarjeta.Ultimos4 = new string((tarjeta.Ultimos4 ?? "").Where(char.IsDigit).ToArray());
            if (tarjeta.Ultimos4.Length > 4)
                tarjeta.Ultimos4 = tarjeta.Ultimos4[^4..];

            _context.Tarjetas.Add(tarjeta);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Tarjeta {Marca} ****{U4} guardada para usuario {UsuarioId}", tarjeta.Marca, tarjeta.Ultimos4, tarjeta.UsuarioId);
            return Ok(tarjeta);
        }

        // DELETE: api/tarjeta/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var tarjeta = await _context.Tarjetas.FindAsync(id);
            if (tarjeta == null) return NotFound(new { mensaje = "Tarjeta no encontrada" });
            _context.Tarjetas.Remove(tarjeta);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
