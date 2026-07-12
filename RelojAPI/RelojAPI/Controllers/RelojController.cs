using Microsoft.AspNetCore.Mvc;
using RelojAPI.Interfaces;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelojController : ControllerBase
    {
        // Inyeccion de Dependencias (DI): IRelojService (interface propia), ILogger, IConfiguration
        private readonly IRelojService _relojService;
        private readonly ILogger<RelojController> _logger;
        private readonly IConfiguration _configuration;

        public RelojController(IRelojService relojService, ILogger<RelojController> logger, IConfiguration configuration)
        {
            _relojService = relojService;
            _logger = logger;
            _configuration = configuration;
        }

        // GET: api/reloj
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Reloj>>> GetAll()
        {
            _logger.LogInformation("GET /api/reloj - Obteniendo todos los relojes");
            var appName = _configuration["AppSettings:Nombre"] ?? "RelojAPI";
            _logger.LogInformation("Solicitud procesada por la aplicacion: {AppName}", appName);

            var relojes = await _relojService.GetAllAsync();
            return Ok(relojes);
        }

        // GET: api/reloj/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Reloj>> GetById(int id)
        {
            _logger.LogInformation("GET /api/reloj/{Id} - Buscando reloj", id);

            var reloj = await _relojService.GetByIdAsync(id);
            if (reloj == null)
            {
                _logger.LogWarning("Reloj con Id {Id} no encontrado", id);
                return NotFound(new { mensaje = $"Reloj con Id {id} no encontrado" });
            }

            return Ok(reloj);
        }

        // POST: api/reloj
        [HttpPost]
        public async Task<ActionResult<Reloj>> Create([FromBody] Reloj reloj)
        {
            _logger.LogInformation("POST /api/reloj - Creando nuevo reloj: {Nombre}", reloj.Nombre);

            var created = await _relojService.CreateAsync(reloj);

            _logger.LogInformation("Reloj creado con Id {Id}", created.Id);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        // PUT: api/reloj/5
        [HttpPut("{id}")]
        public async Task<ActionResult<Reloj>> Update(int id, [FromBody] Reloj reloj)
        {
            _logger.LogInformation("PUT /api/reloj/{Id} - Actualizando reloj", id);

            var updated = await _relojService.UpdateAsync(id, reloj);
            if (updated == null)
            {
                _logger.LogWarning("No se encontro el reloj con Id {Id} para actualizar", id);
                return NotFound(new { mensaje = $"Reloj con Id {id} no encontrado" });
            }

            return Ok(updated);
        }

        // PUT: api/reloj/5/compatibilidad  -> define que maquinas y pulseras admite el reloj
        [HttpPut("{id}/compatibilidad")]
        public async Task<ActionResult<Reloj>> SetCompatibilidad(int id, [FromBody] CompatibilidadDto dto)
        {
            _logger.LogInformation("PUT /api/reloj/{Id}/compatibilidad - {Maq} maquinas, {Pul} pulseras", id, dto.MovimientoIds.Count, dto.TipoPulseraIds.Count);

            var updated = await _relojService.SetCompatibilidadAsync(id, dto.MovimientoIds, dto.TipoPulseraIds);
            if (updated == null)
                return NotFound(new { mensaje = $"Reloj con Id {id} no encontrado" });

            return Ok(updated);
        }

        // DELETE: api/reloj/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            _logger.LogInformation("DELETE /api/reloj/{Id} - Eliminando reloj", id);

            var deleted = await _relojService.DeleteAsync(id);
            if (!deleted)
            {
                _logger.LogWarning("No se encontro el reloj con Id {Id} para eliminar", id);
                return NotFound(new { mensaje = $"Reloj con Id {id} no encontrado" });
            }

            _logger.LogInformation("Reloj con Id {Id} eliminado exitosamente", id);
            return NoContent();
        }
    }

    // DTO para asignar compatibilidad (que componentes admite un reloj)
    public class CompatibilidadDto
    {
        public List<int> MovimientoIds { get; set; } = new();
        public List<int> TipoPulseraIds { get; set; } = new();
    }
}
