using Microsoft.EntityFrameworkCore;
using RelojAPI.Models;

namespace RelojAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Marca> Marcas { get; set; }
        public DbSet<Reloj> Relojes { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<SiteConfig> Configuracion { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuracion tabla Marcas
            modelBuilder.Entity<Marca>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(m => m.PaisOrigen).HasMaxLength(100);
                entity.Property(m => m.Descripcion).HasMaxLength(500);
            });

            // Configuracion tabla Usuarios
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Apellido).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
                entity.Property(u => u.Telefono).HasMaxLength(20);
                entity.Property(u => u.Direccion).HasMaxLength(300);
            });

            // Configuracion del sitio (una sola fila)
            modelBuilder.Entity<SiteConfig>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.SitioNombre).IsRequired().HasMaxLength(150);
                entity.Property(c => c.SitioSubtitulo).HasMaxLength(200);
                entity.Property(c => c.HeroTitulo).HasMaxLength(250);
                entity.Property(c => c.HeroSubtitulo).HasMaxLength(500);
                entity.Property(c => c.FooterTagline).HasMaxLength(250);
                entity.Property(c => c.FooterCopyright).HasMaxLength(250);
            });

            // Configuracion tabla Relojes
            modelBuilder.Entity<Reloj>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(r => r.Modelo).HasMaxLength(100);
                entity.Property(r => r.Precio).HasColumnType("decimal(18,2)");

                // Relacion con Marca
                entity.HasOne(r => r.Marca)
                      .WithMany(m => m.Relojes)
                      .HasForeignKey(r => r.MarcaId);
            });
        }
    }
}
