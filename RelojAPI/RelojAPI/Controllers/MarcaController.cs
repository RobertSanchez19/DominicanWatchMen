using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcaController : ControllerBase
    {
        // Inyeccion de Dependencias (DI): AppDbContext e ILogger
        private readonly AppDbContext _context;
        private readonly ILogger<MarcaController> _logger;

        public MarcaController(AppDbContext context, ILogger<MarcaController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/marca
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Marca>>> GetAll()
        {
            _logger.LogInformation("GET /api/marca - Obteniendo todas las marcas");
            var marcas = await _context.Marcas
                .Include(m => m.Relojes)
                .ToListAsync();
            return Ok(marcas);
        }

        // GET: api/marca/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Marca>> GetById(int id)
        {
            _logger.LogInformation("GET /api/marca/{Id} - Buscando marca", id);

            var marca = await _context.Marcas
                .Include(m => m.Relojes)
                .FirstOrDefaultAsync(m => m.Id == id);
            if (marca == null)
            {
                _logger.LogWarning("Marca con Id {Id} no encontrada", id);
                return NotFound(new { mensaje = $"Marca con Id {id} no encontrada" });
            }

            return Ok(marca);
        }

        // POST: api/marca
        [HttpPost]
        public async Task<ActionResult<Marca>> Create([FromBody] Marca marca)
        {
            _logger.LogInformation("POST /api/marca - Creando marca: {Nombre}", marca.Nombre);

            _context.Marcas.Add(marca);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Marca creada con Id {Id}", marca.Id);
            return CreatedAtAction(nameof(GetById), new { id = marca.Id }, marca);
        }

        // PUT: api/marca/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Marca>> Update(int id, [FromBody] Marca marca)
        {
            _logger.LogInformation("PUT /api/marca/{Id} - Actualizando marca", id);

            var existing = await _context.Marcas.FindAsync(id);
            if (existing == null)
            {
                _logger.LogWarning("Marca con Id {Id} no encontrada para actualizar", id);
                return NotFound(new { mensaje = $"Marca con Id {id} no encontrada" });
            }

            existing.Nombre = marca.Nombre;
            existing.PaisOrigen = marca.PaisOrigen;
            existing.Descripcion = marca.Descripcion;
            existing.LogoUrl = marca.LogoUrl;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Marca con Id {Id} actualizada exitosamente", id);
            return Ok(existing);
        }

        // DELETE: api/marca/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            _logger.LogInformation("DELETE /api/marca/{Id} - Eliminando marca", id);

            var marca = await _context.Marcas.FindAsync(id);
            if (marca == null)
            {
                _logger.LogWarning("Marca con Id {Id} no encontrada para eliminar", id);
                return NotFound(new { mensaje = $"Marca con Id {id} no encontrada" });
            }

            _context.Marcas.Remove(marca);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Marca con Id {Id} eliminada exitosamente", id);
            return NoContent();
        }
    }
}
