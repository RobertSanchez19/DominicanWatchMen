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
            return await _context.Relojes.Include(r => r.Marca).ToListAsync();
        }

        public async Task<Reloj?> GetByIdAsync(int id)
        {
            return await _context.Relojes.Include(r => r.Marca).FirstOrDefaultAsync(r => r.Id == id);
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
