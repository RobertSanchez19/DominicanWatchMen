using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Models;

namespace RelojAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TicketController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<TicketController> _logger;

        public TicketController(AppDbContext context, ILogger<TicketController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/ticket           -> todos (soporte/admin)
        // GET: api/ticket?usuarioId=5 -> los de un cliente
        // GET: api/ticket?estado=Abierto
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ticket>>> GetAll([FromQuery] int? usuarioId, [FromQuery] string? estado)
        {
            var query = _context.Tickets.Include(t => t.Mensajes).AsQueryable();
            if (usuarioId.HasValue) query = query.Where(t => t.UsuarioId == usuarioId.Value);
            if (!string.IsNullOrWhiteSpace(estado)) query = query.Where(t => t.Estado == estado);
            var tickets = await query.OrderByDescending(t => t.Fecha).ToListAsync();
            return Ok(tickets);
        }

        // GET: api/ticket/5  (con hilo de mensajes)
        [HttpGet("{id}")]
        public async Task<ActionResult<Ticket>> GetById(int id)
        {
            var ticket = await _context.Tickets.Include(t => t.Mensajes).FirstOrDefaultAsync(t => t.Id == id);
            if (ticket == null) return NotFound(new { mensaje = $"Ticket {id} no encontrado" });
            return Ok(ticket);
        }

        // POST: api/ticket  (el cliente reporta un problema)
        [HttpPost]
        public async Task<ActionResult<Ticket>> Create([FromBody] Ticket ticket)
        {
            ticket.Estado = "Abierto";
            ticket.Fecha = DateTime.UtcNow;
            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Ticket #{Id} creado por {Email} (pedido {PedidoId})", ticket.Id, ticket.Email, ticket.PedidoId);
            return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
        }

        // POST: api/ticket/5/mensaje  (respuesta en el hilo)
        [HttpPost("{id}/mensaje")]
        public async Task<ActionResult> AgregarMensaje(int id, [FromBody] TicketMensaje mensaje)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound(new { mensaje = $"Ticket {id} no encontrado" });

            mensaje.TicketId = id;
            mensaje.Fecha = DateTime.UtcNow;
            _context.TicketMensajes.Add(mensaje);

            // Si responde el soporte y el ticket estaba Abierto, pasa a En progreso
            if (mensaje.EsSoporte && ticket.Estado == "Abierto")
                ticket.Estado = "En progreso";

            await _context.SaveChangesAsync();
            return Ok(mensaje);
        }

        // PUT: api/ticket/5/estado  (soporte/admin cambia el estado)
        [HttpPut("{id}/estado")]
        public async Task<ActionResult> CambiarEstado(int id, [FromBody] EstadoTicketDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return NotFound(new { mensaje = $"Ticket {id} no encontrado" });
            ticket.Estado = dto.Estado;
            await _context.SaveChangesAsync();
            return Ok(new { id = ticket.Id, estado = ticket.Estado });
        }
    }

    public class EstadoTicketDto
    {
        public string Estado { get; set; } = string.Empty;
    }
}
