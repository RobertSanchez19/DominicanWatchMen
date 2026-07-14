using Microsoft.EntityFrameworkCore;
using RelojAPI.Data;
using RelojAPI.Interfaces;
using RelojAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== REGISTRO DE SERVICIOS EN EL CONTENEDOR DE DI =====

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Reloj API",
        Version = "v1",
        Description = "API para gestion de relojes y marcas - Primera Evaluacion Parcial UNPHU"
    });
});

// CORS - permite que el frontend HTML llame a la API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Controladores
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Conexion a SQL Server usando la cadena de conexion del appsettings.json
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registro de interface propia (DI) - Scoped: una instancia por solicitud HTTP
builder.Services.AddScoped<IRelojService, RelojService>();
builder.Services.AddScoped<RelojAPI.Services.IEmailService, RelojAPI.Services.EmailService>();

// ILogger e IConfiguration son registrados automaticamente por el framework ASP.NET Core

// Garantiza que wwwroot/images exista antes de que la app inicie
var wwwrootImages = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "images");
Directory.CreateDirectory(wwwrootImages);

var app = builder.Build();

// ===== SEED: crea admin por defecto si no existe ninguno =====
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Usuarios.Any(u => u.EsAdmin))
    {
        db.Usuarios.Add(new RelojAPI.Models.Usuario
        {
            Nombre       = "Admin",
            Apellido     = "DWM",
            Email        = "admin@dwm.com",
            PasswordHash = Convert.ToHexString(
                System.Security.Cryptography.SHA256.HashData(
                    System.Text.Encoding.UTF8.GetBytes("Admin123"))).ToLower(),
            EsAdmin      = true,
            Rol          = "Admin",
            Activo       = true
        });
        db.SaveChanges();
    }

    // Sincroniza el Rol para usuarios que existian antes de la columna Rol (o quedaron vacios)
    var usuariosArreglar = db.Usuarios.Where(u => u.Rol == null || u.Rol == "" || (u.EsAdmin && u.Rol != "Admin")).ToList();
    if (usuariosArreglar.Count > 0)
    {
        foreach (var u in usuariosArreglar) u.Rol = u.EsAdmin ? "Admin" : "Cliente";
        db.SaveChanges();
    }

    // ===== SEED: maquinas (movimientos) =====
    if (!db.Movimientos.Any())
    {
        db.Movimientos.AddRange(
            new RelojAPI.Models.Movimiento { Nombre = "NH35",        Descripcion = "Automatico Seiko, 41h de reserva",      PrecioExtra = 0,    Stock = 40 },
            new RelojAPI.Models.Movimiento { Nombre = "NH34",        Descripcion = "Automatico Seiko con funcion GMT",       PrecioExtra = 2500, Stock = 15 },
            new RelojAPI.Models.Movimiento { Nombre = "Miyota 8215", Descripcion = "Automatico Miyota (Citizen), robusto",   PrecioExtra = 1200, Stock = 25 },
            new RelojAPI.Models.Movimiento { Nombre = "NH38",        Descripcion = "Automatico Seiko con corazon abierto",   PrecioExtra = 1800, Stock = 12 },
            new RelojAPI.Models.Movimiento { Nombre = "VK63",        Descripcion = "Meca-quartz con cronografo",             PrecioExtra = 900,  Stock = 10 }
        );
        db.SaveChanges();
    }

    // ===== SEED: tipos de pulsera =====
    if (!db.TiposPulsera.Any())
    {
        db.TiposPulsera.AddRange(
            new RelojAPI.Models.TipoPulsera { Nombre = "Oyster",         Material = "Metal",  PrecioExtra = 0,    Stock = 30 },
            new RelojAPI.Models.TipoPulsera { Nombre = "Jubilee",        Material = "Metal",  PrecioExtra = 800,  Stock = 20 },
            new RelojAPI.Models.TipoPulsera { Nombre = "President",      Material = "Metal",  PrecioExtra = 1500, Stock = 8  },
            new RelojAPI.Models.TipoPulsera { Nombre = "Beads of Rice",  Material = "Metal",  PrecioExtra = 1000, Stock = 12 },
            new RelojAPI.Models.TipoPulsera { Nombre = "Super Engineer", Material = "Metal",  PrecioExtra = 900,  Stock = 10 },
            new RelojAPI.Models.TipoPulsera { Nombre = "NATO",           Material = "Nylon",  PrecioExtra = 0,    Stock = 50 },
            new RelojAPI.Models.TipoPulsera { Nombre = "Tropic",         Material = "Caucho", PrecioExtra = 400,  Stock = 25 },
            new RelojAPI.Models.TipoPulsera { Nombre = "Waffle",         Material = "Caucho", PrecioExtra = 400,  Stock = 25 },
            new RelojAPI.Models.TipoPulsera { Nombre = "FKM",            Material = "Caucho", PrecioExtra = 700,  Stock = 18 },
            new RelojAPI.Models.TipoPulsera { Nombre = "Cuero",          Material = "Cuero",  PrecioExtra = 300,  Stock = 22 }
        );
        db.SaveChanges();
    }

    // ===== SEED: stock inicial de componentes (si todos quedaron en 0, ej. tras migracion) =====
    if (!db.Movimientos.Any(m => m.Stock > 0) && !db.TiposPulsera.Any(t => t.Stock > 0))
    {
        foreach (var m in db.Movimientos)
            m.Stock = m.Nombre switch { "NH35" => 40, "NH34" => 15, "Miyota 8215" => 25, "NH38" => 12, "VK63" => 10, _ => 10 };
        foreach (var t in db.TiposPulsera)
            t.Stock = t.Nombre switch { "Oyster" => 30, "Jubilee" => 20, "President" => 8, "Beads of Rice" => 12, "Super Engineer" => 10, "NATO" => 50, "Tropic" => 25, "Waffle" => 25, "FKM" => 18, "Cuero" => 22, _ => 15 };
        db.SaveChanges();
    }

    // ===== SEED: compatibilidad por defecto para relojes sin opciones =====
    // (modelo BOM: cada componente ya tiene su stock; aqui solo definimos que admite cada reloj)
    var relojesSinOpciones = db.Relojes
        .Include(r => r.MovimientosCompatibles)
        .Include(r => r.PulserasCompatibles)
        .Where(r => !r.MovimientosCompatibles.Any() && !r.PulserasCompatibles.Any())
        .ToList();
    if (relojesSinOpciones.Count > 0)
    {
        var maquinasDef = db.Movimientos.Where(m => m.Nombre == "NH35" || m.Nombre == "NH34" || m.Nombre == "Miyota 8215").ToList();
        var pulserasDef = db.TiposPulsera.Where(t => t.Nombre == "Oyster" || t.Nombre == "Jubilee" || t.Nombre == "NATO").ToList();
        foreach (var r in relojesSinOpciones)
        {
            foreach (var m in maquinasDef) r.MovimientosCompatibles.Add(m);
            foreach (var p in pulserasDef) r.PulserasCompatibles.Add(p);
        }
        db.SaveChanges();
    }

    // ===== SEED: piezas de taller (fabricacion) =====
    if (!db.Piezas.Any())
    {
        db.Piezas.AddRange(
            new RelojAPI.Models.Pieza { Categoria = "Case",    Nombre = "Case Diver 40mm",        Tipo = "Diver",     Color = "Acero",      Material = "316L",       Stock = 20 },
            new RelojAPI.Models.Pieza { Categoria = "Case",    Nombre = "Case Dress 39mm",        Tipo = "Dress",     Color = "Oro",        Material = "316L PVD",   Stock = 10 },
            new RelojAPI.Models.Pieza { Categoria = "Dial",    Nombre = "Dial Sunburst Azul",     Tipo = "Sunburst",  Color = "Azul",       Material = "Laton",      Stock = 15 },
            new RelojAPI.Models.Pieza { Categoria = "Dial",    Nombre = "Dial Mate Negro",        Tipo = "Mate",      Color = "Negro",      Material = "Laton",      Stock = 25 },
            new RelojAPI.Models.Pieza { Categoria = "Bezel",   Nombre = "Bezel Ceramica Pepsi",   Tipo = "GMT",       Color = "Azul/Rojo",  Material = "Ceramica",   Stock = 12 },
            new RelojAPI.Models.Pieza { Categoria = "Bezel",   Nombre = "Bezel Aluminio Negro",   Tipo = "Diver",     Color = "Negro",      Material = "Aluminio",   Stock = 18 },
            new RelojAPI.Models.Pieza { Categoria = "Aguja",   Nombre = "Set Agujas Mercedes",    Tipo = "Mercedes",  Color = "Plata",      Material = "Acero",      Stock = 30 },
            new RelojAPI.Models.Pieza { Categoria = "Aguja",   Nombre = "Set Agujas Dauphine",    Tipo = "Dauphine",  Color = "Oro",        Material = "Acero",      Stock = 14 },
            new RelojAPI.Models.Pieza { Categoria = "Maquina", Nombre = "NH35 (taller)",          Tipo = "Automatico",Color = "-",          Material = "-",          Stock = 22 },
            new RelojAPI.Models.Pieza { Categoria = "Pulsera", Nombre = "Oyster 20mm (taller)",   Tipo = "Oyster",    Color = "Acero",      Material = "316L",       Stock = 16 }
        );
        db.SaveChanges();
    }

    // ===== SEED: cupones demo =====
    if (!db.Cupones.Any())
    {
        db.Cupones.AddRange(
            new RelojAPI.Models.Cupon { Codigo = "BIENVENIDO10", Tipo = "porcentaje", Valor = 10,  Activo = true },
            new RelojAPI.Models.Cupon { Codigo = "DWM500",       Tipo = "monto",      Valor = 500, Activo = true }
        );
        db.SaveChanges();
    }
}

// ===== CONFIGURACION DEL PIPELINE HTTP =====

// Swagger disponible en todos los entornos
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Reloj API v1");
    options.RoutePrefix = string.Empty; // Swagger en la raiz: http://localhost:PORT/
});

app.UseCors("AllowFrontend");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    RequestPath = ""
});
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
