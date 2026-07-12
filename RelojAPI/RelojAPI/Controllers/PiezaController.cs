using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PiezaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PiezaController> _logger;

        public PiezaController(AppDbContext context, ILogger<PiezaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/pieza?categoria=Dial   (categoria opcional)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pieza>>> GetAll([FromQuery] string? categoria)
        {
            var query = _context.Piezas.AsQueryable();
            if (!string.IsNullOrWhiteSpace(categoria))
                query = query.Where(p => p.Categoria == categoria);
            return Ok(await query.OrderBy(p => p.Categoria).ThenBy(p => p.Nombre).ToListAsync());
        }

        // GET: api/pieza/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pieza>> GetById(int id)
        {
            var pieza = await _context.Piezas.FindAsync(id);
            if (pieza == null) return NotFound(new { mensaje = $"Pieza {id} no encontrada" });
            return Ok(pieza);
        }

        // POST: api/pieza
        [HttpPost]
        public async Task<ActionResult<Pieza>> Create([FromBody] Pieza pieza)
        {
            _context.Piezas.Add(pieza);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Pieza creada #{Id} - {Categoria} {Nombre}", pieza.Id, pieza.Categoria, pieza.Nombre);
            return CreatedAtAction(nameof(GetById), new { id = pieza.Id }, pieza);
        }

        // PUT: api/pieza/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Pieza>> Update(int id, [FromBody] Pieza pieza)
        {
            var existing = await _context.Piezas.FindAsync(id);
            if (existing == null) return NotFound(new { mensaje = $"Pieza {id} no encontrada" });

            existing.Categoria = pieza.Categoria;
            existing.Nombre = pieza.Nombre;
            existing.Tipo = pieza.Tipo;
            existing.Color = pieza.Color;
            existing.Material = pieza.Material;
            existing.Stock = pieza.Stock;
            existing.ImagenUrl = pieza.ImagenUrl;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/pieza/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var pieza = await _context.Piezas.FindAsync(id);
            if (pieza == null) return NotFound(new { mensaje = $"Pieza {id} no encontrada" });
            _context.Piezas.Remove(pieza);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
