using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidoController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<PedidoController> _logger;

        public PedidoController(AppDbContext context, ILogger<PedidoController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/pedido  (todos para el admin; con ?usuarioId= filtra los de un cliente)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pedido>>> GetAll([FromQuery] int? usuarioId)
        {
            _logger.LogInformation("GET /api/pedido - usuarioId: {UsuarioId}", usuarioId);
            var query = _context.Pedidos.Include(p => p.Items).AsQueryable();
            if (usuarioId.HasValue)
                query = query.Where(p => p.UsuarioId == usuarioId.Value);
            var pedidos = await query.OrderByDescending(p => p.Fecha).ToListAsync();
            return Ok(pedidos);
        }

        // PUT: api/pedido/{id}/estado  (el admin cambia el estatus del pedido)
        [HttpPut("{id}/estado")]
        public async Task<ActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
        {
            var pedido = await _context.Pedidos.FindAsync(id);
            if (pedido == null) return NotFound(new { mensaje = $"Pedido {id} no encontrado" });
            pedido.Estado = dto.Estado;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Pedido {Id} -> estado {Estado}", id, dto.Estado);
            return Ok(new { id = pedido.Id, estado = pedido.Estado });
        }

        // GET: api/pedido/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Pedido>> GetById(int id)
        {
            var pedido = await _context.Pedidos.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id);
            if (pedido == null) return NotFound(new { mensaje = $"Pedido con Id {id} no encontrado" });
            return Ok(pedido);
        }

        // POST: api/pedido  -> crea el pedido, valida y descuenta inventario de componentes (BOM)
        [HttpPost]
        public async Task<ActionResult<Pedido>> Create([FromBody] CrearPedidoDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest(new { mensaje = "El pedido no tiene items" });

            var pedido = new Pedido
            {
                NombreCliente = dto.NombreCliente,
                ApellidoCliente = dto.ApellidoCliente,
                Email = dto.Email,
                Telefono = dto.Telefono,
                Direccion = dto.Direccion,
                Ciudad = dto.Ciudad,
                Provincia = dto.Provincia,
                CodigoPostal = dto.CodigoPostal,
                Referencia = dto.Referencia,
                MetodoPago = dto.MetodoPago,
                UsuarioId = dto.UsuarioId,
                Estado = "Pendiente",
            };

            decimal total = 0;
            foreach (var it in dto.Items)
            {
                var reloj = await _context.Relojes.FindAsync(it.RelojId);
                var mov = await _context.Movimientos.FindAsync(it.MovimientoId);
                var pul = await _context.TiposPulsera.FindAsync(it.TipoPulseraId);
                if (reloj == null || mov == null || pul == null)
                    return BadRequest(new { mensaje = "Un item tiene un componente invalido" });

                // Disponibilidad = minimo entre los tres componentes (assemble-to-order / BOM)
                int disponible = Math.Min(reloj.Stock, Math.Min(mov.Stock, pul.Stock));
                if (it.Cantidad < 1 || it.Cantidad > disponible)
                    return BadRequest(new { mensaje = $"Sin stock suficiente para {reloj.Nombre} ({mov.Nombre} / {pul.Nombre}). Disponible: {disponible}" });

                // Descontar 1 de cada componente por unidad
                reloj.Stock -= it.Cantidad;
                mov.Stock -= it.Cantidad;
                pul.Stock -= it.Cantidad;

                decimal precioUnit = reloj.Precio + mov.PrecioExtra + pul.PrecioExtra;
                decimal subtotal = precioUnit * it.Cantidad;
                total += subtotal;

                pedido.Items.Add(new PedidoItem
                {
                    RelojId = reloj.Id,
                    RelojNombre = reloj.Nombre,
                    MovimientoId = mov.Id,
                    MaquinaNombre = mov.Nombre,
                    TipoPulseraId = pul.Id,
                    PulseraNombre = pul.Nombre,
                    Cantidad = it.Cantidad,
                    PrecioUnitario = precioUnit,
                    Subtotal = subtotal,
                });
            }
            pedido.Total = total;

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Pedido {Id} creado ({Email}) - total {Total}", pedido.Id, pedido.Email, pedido.Total);
            return CreatedAtAction(nameof(GetById), new { id = pedido.Id }, pedido);
        }
    }

    // ===== DTOs para crear el pedido (el servidor calcula precios y valida stock) =====
    public class CrearPedidoDto
    {
        public string NombreCliente { get; set; } = string.Empty;
        public string ApellidoCliente { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Provincia { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public string MetodoPago { get; set; } = string.Empty;
        public int? UsuarioId { get; set; }
        public List<CrearPedidoItemDto> Items { get; set; } = new();
    }

    public class CrearPedidoItemDto
    {
        public int RelojId { get; set; }
        public int MovimientoId { get; set; }
        public int TipoPulseraId { get; set; }
        public int Cantidad { get; set; }
    }

    public class CambiarEstadoDto
    {
        public string Estado { get; set; } = string.Empty;
    }
}
