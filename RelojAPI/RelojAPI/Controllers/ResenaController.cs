using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResenaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ResenaController> _logger;

        public ResenaController(AppDbContext context, ILogger<ResenaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/resena?relojId=5
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Resena>>> GetAll([FromQuery] int? relojId)
        {
            var query = _context.Resenas.AsQueryable();
            if (relojId.HasValue) query = query.Where(r => r.RelojId == relojId.Value);
            return Ok(await query.OrderByDescending(r => r.Fecha).ToListAsync());
        }

        // POST: api/resena  (un cliente valora un reloj; una resena por usuario/reloj)
        [HttpPost]
        public async Task<ActionResult<Resena>> Create([FromBody] Resena resena)
        {
            if (resena.Calificacion < 1 || resena.Calificacion > 5)
                return BadRequest(new { mensaje = "La calificacion debe ser de 1 a 5" });

            var existente = await _context.Resenas.FirstOrDefaultAsync(r => r.RelojId == resena.RelojId && r.UsuarioId == resena.UsuarioId);
            if (existente != null)
            {
                existente.Calificacion = resena.Calificacion;
                existente.Comentario = resena.Comentario;
                existente.Fecha = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return Ok(existente);
            }

            resena.Fecha = DateTime.UtcNow;
            _context.Resenas.Add(resena);
            await _context.SaveChangesAsync();
            return Ok(resena);
        }

        // DELETE: api/resena/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var resena = await _context.Resenas.FindAsync(id);
            if (resena == null) return NotFound();
            _context.Resenas.Remove(resena);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
