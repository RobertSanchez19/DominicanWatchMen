using RelojBlazor.Components;
using RelojBlazor.Interfaces;
using RelojBlazor.Services;

var builder = WebApplication.CreateBuilder(args);

// ===== REGISTRO DE SERVICIOS =====
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// HttpClient tipado para IRelojService — la URL base se lee de appsettings.json
builder.Services.AddHttpClient<IRelojService, RelojService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});

// AuthService: Scoped = una instancia por conexión SignalR (estado de login compartido)
// Se registra cliente nombrado + servicio scoped por separado para evitar conflicto transient/scoped
builder.Services.AddHttpClient("auth-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});
builder.Services.AddScoped<IAuthService, AuthService>();

// SiteConfigService: configuración editable del sitio (logo, branding, portada, footer)
builder.Services.AddHttpClient("config-api", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ApiSettings:BaseUrl"]!);
});
builder.Services.AddScoped<ISiteConfigService, SiteConfigService>();

// ILogger<T> e IConfiguration son registrados automáticamente por el framework

var app = builder.Build();

// ===== PIPELINE HTTP =====
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();
app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
