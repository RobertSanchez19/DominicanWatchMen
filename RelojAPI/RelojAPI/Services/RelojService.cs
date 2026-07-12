using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Interfaces;
using RelojAPI.Models;

namespace RelojAPI.Services
{
    // Implementacion concreta de IRelojService - registrada en DI como Scoped
    public class RelojService : IRelojService
    {
        private readonly AppDbContext _context;

        public RelojService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Reloj>> GetAllAsync()
        {
            return await _context.Relojes
                .Include(r => r.Marca)
                .Include(r => r.MovimientosCompatibles)
                .Include(r => r.PulserasCompatibles)
                .ToListAsync();
        }

        public async Task<Reloj?> GetByIdAsync(int id)
        {
            return await _context.Relojes
                .Include(r => r.Marca)
                .Include(r => r.MovimientosCompatibles)
                .Include(r => r.PulserasCompatibles)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        // Asigna que maquinas y pulseras son compatibles con un reloj (many-to-many)
        public async Task<Reloj?> SetCompatibilidadAsync(int id, List<int> movimientoIds, List<int> tipoPulseraIds)
        {
            var reloj = await _context.Relojes
                .Include(r => r.MovimientosCompatibles)
                .Include(r => r.PulserasCompatibles)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (reloj == null) return null;

            var movs = await _context.Movimientos.Where(m => movimientoIds.Contains(m.Id)).ToListAsync();
            var puls = await _context.TiposPulsera.Where(t => tipoPulseraIds.Contains(t.Id)).ToListAsync();

            reloj.MovimientosCompatibles.Clear();
            foreach (var m in movs) reloj.MovimientosCompatibles.Add(m);
            reloj.PulserasCompatibles.Clear();
            foreach (var p in puls) reloj.PulserasCompatibles.Add(p);

            await _context.SaveChangesAsync();
            return reloj;
        }

        public async Task<Reloj> CreateAsync(Reloj reloj)
        {
            _context.Relojes.Add(reloj);
            await _context.SaveChangesAsync();
            // Recargar con Marca incluida
            return await _context.Relojes.Include(r => r.Marca).FirstAsync(r => r.Id == reloj.Id);
        }

        public async Task<Reloj?> UpdateAsync(int id, Reloj reloj)
        {
            var existing = await _context.Relojes.FindAsync(id);
            if (existing == null) return null;

            existing.Nombre = reloj.Nombre;
            existing.Modelo = reloj.Modelo;
            existing.Precio = reloj.Precio;
            existing.Stock = reloj.Stock;
            existing.MarcaId = reloj.MarcaId;
            existing.ImagenUrl = reloj.ImagenUrl;
            existing.Destacado = reloj.Destacado;
            existing.TipoModelo = reloj.TipoModelo;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var reloj = await _context.Relojes.FindAsync(id);
            if (reloj == null) return false;

            _context.Relojes.Remove(reloj);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
