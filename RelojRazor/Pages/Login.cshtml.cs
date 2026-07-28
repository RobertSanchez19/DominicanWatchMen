using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Services;

namespace RelojRazor.Pages;

// Inicio de sesion en dos posibles pasos:
//  1) correo + contraseña
//  2) codigo de verificacion (2FA) si el usuario lo tiene activado.
public class LoginModel : PageModel
{
    private readonly IAuthService _auth;

    public LoginModel(IAuthService auth) => _auth = auth;

    // Propiedades del formulario (viajan del .cshtml al .cshtml.cs)
    [BindProperty] public string Email { get; set; } = string.Empty;
    [BindProperty] public string Password { get; set; } = string.Empty;
    [BindProperty] public bool Recordar { get; set; }
    [BindProperty] public string Codigo { get; set; } = string.Empty;
    [BindProperty] public int UsuarioId { get; set; }

    [BindProperty(SupportsGet = true)] public string? ReturnUrl { get; set; }

    // Estado que el .cshtml.cs devuelve al .cshtml
    public bool PasoDosFactor { get; set; }
    public string? Error { get; set; }
    public string? AvisoDemo { get; set; }

    public IActionResult OnGet()
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToPage("/Index");
        return Page();
    }

    // Paso 1: valida credenciales.
    public async Task<IActionResult> OnPostCredencialesAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            Error = "Completa todos los campos.";
            return Page();
        }

        var r = await _auth.LoginAsync(Email, Password);

        if (!r.Exito)
        {
            Error = r.Error;
            return Page();
        }

        // La API pide un segundo factor: mostramos el paso del codigo.
        if (r.Requiere2FA)
        {
            PasoDosFactor = true;
            UsuarioId = r.UsuarioId;
            if (!string.IsNullOrWhiteSpace(r.CodigoDemo))
                AvisoDemo = $"Modo demo (sin correo configurado). Tu código es: {r.CodigoDemo}";
            return Page();
        }

        await SesionHelper.IniciarSesionAsync(HttpContext, r.Usuario!, Recordar);
        return RedirigirTrasLogin();
    }

    // Paso 2: valida el codigo 2FA.
    public async Task<IActionResult> OnPostCodigoAsync()
    {
        if (string.IsNullOrWhiteSpace(Codigo))
        {
            PasoDosFactor = true;
            Error = "Ingresa el código que recibiste.";
            return Page();
        }

        var r = await _auth.Verificar2FAAsync(UsuarioId, Codigo);
        if (!r.Exito)
        {
            PasoDosFactor = true;
            Error = r.Error;
            return Page();
        }

        await SesionHelper.IniciarSesionAsync(HttpContext, r.Usuario!, Recordar);
        return RedirigirTrasLogin();
    }

    private IActionResult RedirigirTrasLogin()
    {
        if (!string.IsNullOrWhiteSpace(ReturnUrl) && Url.IsLocalUrl(ReturnUrl))
            return LocalRedirect(ReturnUrl);
        return RedirectToPage("/Index");
    }
}
