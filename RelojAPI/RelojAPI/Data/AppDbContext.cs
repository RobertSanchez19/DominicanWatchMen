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
        public DbSet<Movimiento> Movimientos { get; set; }
        public DbSet<TipoPulsera> TiposPulsera { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<PedidoItem> PedidoItems { get; set; }
        public DbSet<TarjetaGuardada> Tarjetas { get; set; }

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

                entity.Property(r => r.TipoModelo).HasMaxLength(50);
            });

            // Configuracion tabla Movimientos (maquinas)
            modelBuilder.Entity<Movimiento>(entity =>
            {
                entity.HasKey(m => m.Id);
                entity.Property(m => m.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(m => m.Descripcion).HasMaxLength(300);
                entity.Property(m => m.PrecioExtra).HasColumnType("decimal(18,2)");
            });

            // Configuracion tabla TiposPulsera
            modelBuilder.Entity<TipoPulsera>(entity =>
            {
                entity.HasKey(t => t.Id);
                entity.Property(t => t.Nombre).IsRequired().HasMaxLength(100);
                entity.Property(t => t.Material).HasMaxLength(50);
                entity.Property(t => t.PrecioExtra).HasColumnType("decimal(18,2)");
            });

            // Relaciones many-to-many: un reloj es compatible con varias maquinas y varias pulseras
            // (y viceversa). EF crea las tablas de union. El inventario vive en cada componente.
            modelBuilder.Entity<Reloj>()
                .HasMany(r => r.MovimientosCompatibles)
                .WithMany(m => m.RelojesCompatibles)
                .UsingEntity(j => j.ToTable("RelojMovimiento"));

            modelBuilder.Entity<Reloj>()
                .HasMany(r => r.PulserasCompatibles)
                .WithMany(t => t.RelojesCompatibles)
                .UsingEntity(j => j.ToTable("RelojTipoPulsera"));

            // Pedidos (ordenes de compra) y sus lineas
            modelBuilder.Entity<Pedido>(entity =>
            {
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Total).HasColumnType("decimal(18,2)");
                entity.HasMany(p => p.Items)
                      .WithOne(i => i.Pedido)
                      .HasForeignKey(i => i.PedidoId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            modelBuilder.Entity<PedidoItem>(entity =>
            {
                entity.HasKey(i => i.Id);
                entity.Property(i => i.PrecioUnitario).HasColumnType("decimal(18,2)");
                entity.Property(i => i.Subtotal).HasColumnType("decimal(18,2)");
            });
        }
    }
}
