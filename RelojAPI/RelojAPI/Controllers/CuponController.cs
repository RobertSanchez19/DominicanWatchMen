using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CuponController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CuponController> _logger;

        public CuponController(AppDbContext context, ILogger<CuponController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/cupon  (admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cupon>>> GetAll()
            => Ok(await _context.Cupones.OrderBy(c => c.Codigo).ToListAsync());

        // GET: api/cupon/validar/BIENVENIDO10  -> devuelve el cupon si es valido
        [HttpGet("validar/{codigo}")]
        public async Task<ActionResult<Cupon>> Validar(string codigo)
        {
            var cupon = await _context.Cupones.FirstOrDefaultAsync(c => c.Codigo.ToLower() == codigo.ToLower() && c.Activo);
            if (cupon == null) return NotFound(new { mensaje = "Cupon invalido o expirado" });
            return Ok(cupon);
        }

        // POST: api/cupon  (admin)
        [HttpPost]
        public async Task<ActionResult<Cupon>> Create([FromBody] Cupon cupon)
        {
            cupon.Codigo = cupon.Codigo.Trim().ToUpper();
            _context.Cupones.Add(cupon);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAll), new { id = cupon.Id }, cupon);
        }

        // PUT: api/cupon/5  (admin)
        [HttpPut("{id}")]
        public async Task<ActionResult<Cupon>> Update(int id, [FromBody] Cupon cupon)
        {
            var existing = await _context.Cupones.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Codigo = cupon.Codigo.Trim().ToUpper();
            existing.Tipo = cupon.Tipo;
            existing.Valor = cupon.Valor;
            existing.Activo = cupon.Activo;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // DELETE: api/cupon/5  (admin)
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var cupon = await _context.Cupones.FindAsync(id);
            if (cupon == null) return NotFound();
            _context.Cupones.Remove(cupon);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
