using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovimientoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MovimientoController> _logger;

        public MovimientoController(AppDbContext context, ILogger<MovimientoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/movimiento
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movimiento>>> GetAll()
        {
            _logger.LogInformation("GET /api/movimiento - Obteniendo maquinas");
            return Ok(await _context.Movimientos.ToListAsync());
        }

        // GET: api/movimiento/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Movimiento>> GetById(int id)
        {
            var movimiento = await _context.Movimientos.FindAsync(id);
            if (movimiento == null)
                return NotFound(new { mensaje = $"Movimiento con Id {id} no encontrado" });
            return Ok(movimiento);
        }

        // POST: api/movimiento
        [HttpPost]
        public async Task<ActionResult<Movimiento>> Create([FromBody] Movimiento movimiento)
        {
            _logger.LogInformation("POST /api/movimiento - Creando maquina: {Nombre}", movimiento.Nombre);
            _context.Movimientos.Add(movimiento);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = movimiento.Id }, movimiento);
        }

        // PUT: api/movimiento/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Movimiento>> Update(int id, [FromBody] Movimiento movimiento)
        {
            var existing = await _context.Movimientos.FindAsync(id);
            if (existing == null)
                return NotFound(new { mensaje = $"Movimiento con Id {id} no encontrado" });

            existing.Nombre = movimiento.Nombre;
            existing.Descripcion = movimiento.Descripcion;
            existing.PrecioExtra = movimiento.PrecioExtra;
            existing.Stock = movimiento.Stock;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/movimiento/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var movimiento = await _context.Movimientos.FindAsync(id);
            if (movimiento == null)
                return NotFound(new { mensaje = $"Movimiento con Id {id} no encontrado" });

            _context.Movimientos.Remove(movimiento);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
