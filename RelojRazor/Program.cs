using Microsoft.AspNetCore.Authentication.Cookies;
using RelojRazor.Interfaces;
using RelojRazor.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== REGISTRO DE SERVICIOS EN EL CONTENEDOR DE DI =====

// Razor Pages. Se protegen por convencion las carpetas/paginas sensibles.
builder.Services.AddRazorPages(options =>
{
    // "Administración" y "Usuarios" solo para el rol Admin.
    options.Conventions.AuthorizePage("/Admin", "SoloAdmin");
    options.Conventions.AuthorizePage("/AdminMarcas", "SoloAdmin");
    options.Conventions.AuthorizePage("/Usuarios", "SoloAdmin");
    // Taller de fabricacion: Admin o Fabricante. Soporte: Admin o Soporte.
    options.Conventions.AuthorizePage("/Taller", "SoloFabricante");
    options.Conventions.AuthorizePage("/Soporte", "SoloSoporte");
    // "Mi cuenta" requiere sesion (cualquier rol).
    options.Conventions.AuthorizePage("/MiCuenta");
});

// ===== AUTENTICACION POR COOKIES + AUTORIZACION POR ROLES =====
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Login";
        options.LogoutPath = "/Logout";
        options.AccessDeniedPath = "/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(4);
        options.SlidingExpiration = true;
        options.Cookie.Name = "DWM.Auth";
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SoloAdmin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("SoloFabricante", policy => policy.RequireRole("Admin", "Fabricante"));
    options.AddPolicy("SoloSoporte", policy => policy.RequireRole("Admin", "Soporte"));
});

// HttpClient tipado para IRelojService.
// La URL base del Web API se lee del appsettings.json (ApiSettings:BaseUrl),
// no esta quemada en el codigo -> buena practica de configuracion + DI.
builder.Services.AddHttpClient<IRelojService, RelojService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});

// Cliente nombrado + servicio para la configuracion del sitio (branding/footer).
builder.Services.AddHttpClient("config-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});
builder.Services.AddScoped<ISiteConfigService, SiteConfigService>();

// Servicio de autenticacion (login, registro y gestion de usuarios).
builder.Services.AddHttpClient("auth-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});
builder.Services.AddScoped<IAuthService, AuthService>();

// Servicio de noticias (API externa NewsAPI). La URL base va en appsettings y la
// API key en user-secrets (News:ApiKey), fuera del repositorio.
builder.Services.AddHttpClient("news-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["News:BaseUrl"] ?? "https://newsapi.org/");
    client.DefaultRequestHeaders.Add("User-Agent", "DominicanWatchMen/1.0");
});
builder.Services.AddScoped<INoticiasService, NoticiasService>();

// Servicio de enriquecimiento de marcas (Wikipedia + Clearbit, gratis y sin key).
builder.Services.AddHttpClient("marca-web", client =>
{
    client.Timeout = TimeSpan.FromSeconds(8);
    client.DefaultRequestHeaders.Add("User-Agent", "DominicanWatchMen/1.0 (proyecto educativo UNPHU)");
});
builder.Services.AddScoped<IMarcaWebService, MarcaWebService>();

// Cliente general hacia el RelojAPI para taller (piezas) y soporte (tickets).
builder.Services.AddHttpClient("reloj-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});
builder.Services.AddScoped<ITallerService, TallerService>();
builder.Services.AddScoped<ISoporteService, SoporteService>();

// Necesario para leer la sesion del usuario en las vistas (_Layout).
builder.Services.AddHttpContextAccessor();

// ===== CARRITO EN SESION =====
// El carrito es una seleccion temporal: se guarda en la sesion del servidor.
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = "DWM.Session";
});
builder.Services.AddScoped<ICarritoService, CarritoService>();

// ILogger<T> e IConfiguration los registra automaticamente el framework.

var app = builder.Build();

// ===== CONFIGURACION DEL PIPELINE HTTP =====
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapRazorPages();

app.Run();
