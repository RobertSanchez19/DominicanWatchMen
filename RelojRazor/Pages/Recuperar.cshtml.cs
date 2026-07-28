using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;

namespace RelojRazor.Pages;

// "Olvidé mi contraseña": pide el correo y solicita al API un enlace de restablecimiento.
public class RecuperarModel : PageModel
{
    private readonly IAuthService _auth;

    public RecuperarModel(IAuthService auth) => _auth = auth;

    [BindProperty] public string Email { get; set; } = string.Empty;

    // Estado que devuelve el PageModel a la vista.
    public bool Enviado { get; set; }
    public string? Mensaje { get; set; }
    public string? EnlaceDemo { get; set; }

    public void OnGet() { }

    public async Task<IActionResult> OnPostAsync()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            Mensaje = "Ingresa tu correo electrónico.";
            return Page();
        }

        var r = await _auth.RecuperarAsync(Email.Trim());
        Enviado = true;
        Mensaje = r.Mensaje;
        EnlaceDemo = r.EnlaceDemo; // solo llega en modo demo (sin correo configurado)
        return Page();
    }
}
