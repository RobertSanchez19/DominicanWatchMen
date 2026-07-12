using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TipoPulseraController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TipoPulseraController> _logger;

        public TipoPulseraController(AppDbContext context, ILogger<TipoPulseraController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/tipopulsera
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoPulsera>>> GetAll()
        {
            _logger.LogInformation("GET /api/tipopulsera - Obteniendo tipos de pulsera");
            return Ok(await _context.TiposPulsera.ToListAsync());
        }

        // GET: api/tipopulsera/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoPulsera>> GetById(int id)
        {
            var tipo = await _context.TiposPulsera.FindAsync(id);
            if (tipo == null)
                return NotFound(new { mensaje = $"Tipo de pulsera con Id {id} no encontrado" });
            return Ok(tipo);
        }

        // POST: api/tipopulsera
        [HttpPost]
        public async Task<ActionResult<TipoPulsera>> Create([FromBody] TipoPulsera tipo)
        {
            _logger.LogInformation("POST /api/tipopulsera - Creando pulsera: {Nombre}", tipo.Nombre);
            _context.TiposPulsera.Add(tipo);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = tipo.Id }, tipo);
        }

        // PUT: api/tipopulsera/5
        [HttpPut("{id}")]
        public async Task<ActionResult<TipoPulsera>> Update(int id, [FromBody] TipoPulsera tipo)
        {
            var existing = await _context.TiposPulsera.FindAsync(id);
            if (existing == null)
                return NotFound(new { mensaje = $"Tipo de pulsera con Id {id} no encontrado" });

            existing.Nombre = tipo.Nombre;
            existing.Material = tipo.Material;
            existing.PrecioExtra = tipo.PrecioExtra;
            existing.Stock = tipo.Stock;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/tipopulsera/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var tipo = await _context.TiposPulsera.FindAsync(id);
            if (tipo == null)
                return NotFound(new { mensaje = $"Tipo de pulsera con Id {id} no encontrado" });

            _context.TiposPulsera.Remove(tipo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
