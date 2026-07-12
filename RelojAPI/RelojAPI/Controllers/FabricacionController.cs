using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FabricacionController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FabricacionController> _logger;

        public FabricacionController(AppDbContext context, ILogger<FabricacionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/fabricacion/publicar
        // Combina piezas del taller -> descuenta su stock y crea un reloj en el inventario de venta.
        [HttpPost("publicar")]
        public async Task<ActionResult<Reloj>> Publicar([FromBody] PublicarRelojDto dto)
        {
            if (dto.Cantidad < 1)
                return BadRequest(new { mensaje = "La cantidad a producir debe ser al menos 1" });
            if (dto.Piezas == null || dto.Piezas.Count == 0)
                return BadRequest(new { mensaje = "Debes seleccionar al menos una pieza" });

            // Validar y descontar stock de cada pieza del taller
            foreach (var pc in dto.Piezas)
            {
                var pieza = await _context.Piezas.FindAsync(pc.PiezaId);
                if (pieza == null)
                    return BadRequest(new { mensaje = $"Pieza {pc.PiezaId} no existe" });

                int requerido = pc.CantidadPorReloj * dto.Cantidad;
                if (pc.CantidadPorReloj < 1 || pieza.Stock < requerido)
                    return BadRequest(new { mensaje = $"Sin stock suficiente de {pieza.Categoria} '{pieza.Nombre}'. Necesarias: {requerido}, disponibles: {pieza.Stock}" });

                pieza.Stock -= requerido;
            }

            // Compatibilidad para el configurador de venta (default si no se especifica)
            var movIds = (dto.MovimientoIds != null && dto.MovimientoIds.Count > 0)
                ? dto.MovimientoIds
                : await _context.Movimientos.Where(m => m.Nombre == "NH35" || m.Nombre == "NH34" || m.Nombre == "Miyota 8215").Select(m => m.Id).ToListAsync();
            var pulIds = (dto.TipoPulseraIds != null && dto.TipoPulseraIds.Count > 0)
                ? dto.TipoPulseraIds
                : await _context.TiposPulsera.Where(t => t.Nombre == "Oyster" || t.Nombre == "Jubilee" || t.Nombre == "NATO").Select(t => t.Id).ToListAsync();

            var reloj = new Reloj
            {
                Nombre = dto.Nombre,
                Modelo = dto.Modelo,
                MarcaId = dto.MarcaId,
                Precio = dto.Precio,
                Stock = dto.Cantidad,
                TipoModelo = dto.TipoModelo ?? string.Empty,
                ImagenUrl = dto.ImagenUrl,
                MovimientosCompatibles = await _context.Movimientos.Where(m => movIds.Contains(m.Id)).ToListAsync(),
                PulserasCompatibles = await _context.TiposPulsera.Where(t => pulIds.Contains(t.Id)).ToListAsync(),
            };

            _context.Relojes.Add(reloj);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Fabricacion: publicado reloj #{Id} '{Nombre}' x{Cantidad} (consumidas {Piezas} piezas)", reloj.Id, reloj.Nombre, dto.Cantidad, dto.Piezas.Count);

            var creado = await _context.Relojes.Include(r => r.Marca).FirstAsync(r => r.Id == reloj.Id);
            return Ok(creado);
        }
    }

    public class PublicarRelojDto
    {
        public string Nombre { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public int MarcaId { get; set; }
        public decimal Precio { get; set; }
        public string? TipoModelo { get; set; }
        public string? ImagenUrl { get; set; }
        public int Cantidad { get; set; } = 1;
        public List<PiezaConsumoDto> Piezas { get; set; } = new();
        public List<int>? MovimientoIds { get; set; }
        public List<int>? TipoPulseraIds { get; set; }
    }

    public class PiezaConsumoDto
    {
        public int PiezaId { get; set; }
        public int CantidadPorReloj { get; set; } = 1;
    }
}
