using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FavoritoController> _logger;

        public FavoritoController(AppDbContext context, ILogger<FavoritoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/favorito?usuarioId=5  -> los relojes favoritos del usuario
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reloj>>> GetAll([FromQuery] int usuarioId)
        {
            var favIds = _context.Favoritos.Where(f => f.UsuarioId == usuarioId).Select(f => f.RelojId);
            var relojes = await _context.Relojes
                .Include(r => r.Marca)
                .Include(r => r.MovimientosCompatibles)
                .Include(r => r.PulserasCompatibles)
                .Include(r => r.Resenas)
                .Where(r => favIds.Contains(r.Id))
                .ToListAsync();
            return Ok(relojes);
        }

        // POST: api/favorito  { usuarioId, relojId }  -> agrega (si no existe)
        [HttpPost]
        public async Task<ActionResult<Favorito>> Create([FromBody] Favorito fav)
        {
            var existe = await _context.Favoritos.FirstOrDefaultAsync(f => f.UsuarioId == fav.UsuarioId && f.RelojId == fav.RelojId);
            if (existe != null) return Ok(existe);
            _context.Favoritos.Add(fav);
            await _context.SaveChangesAsync();
            return Ok(fav);
        }

        // DELETE: api/favorito?usuarioId=5&relojId=3  -> quita el favorito
        [HttpDelete]
        public async Task<ActionResult> Delete([FromQuery] int usuarioId, [FromQuery] int relojId)
        {
            var fav = await _context.Favoritos.FirstOrDefaultAsync(f => f.UsuarioId == usuarioId && f.RelojId == relojId);
            if (fav == null) return NotFound();
            _context.Favoritos.Remove(fav);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
