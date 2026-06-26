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
            Activo       = true
        });
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
