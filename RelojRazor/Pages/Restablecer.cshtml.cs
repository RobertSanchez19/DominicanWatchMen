using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;

namespace RelojRazor.Pages;

// Segundo paso del "olvidé mi contraseña": con el token del enlace, define la nueva clave.
public class RestablecerModel : PageModel
{
    private readonly IAuthService _auth;

    public RestablecerModel(IAuthService auth) => _auth = auth;

    // El token viaja en la URL (?token=...) y tambien en un campo oculto para el POST.
    [BindProperty(SupportsGet = true)] public string? Token { get; set; }
    [BindProperty] public string NuevaPassword { get; set; } = string.Empty;
    [BindProperty] public string ConfirmarPassword { get; set; } = string.Empty;

    public string? Error { get; set; }
    public bool Exito { get; set; }

    public void OnGet()
    {
        if (string.IsNullOrWhiteSpace(Token))
            Error = "El enlace no es válido. Solicita uno nuevo desde «Olvidé mi contraseña».";
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (string.IsNullOrWhiteSpace(Token))
        {
            Error = "El enlace no es válido. Solicita uno nuevo.";
            return Page();
        }
        if (NuevaPassword.Length < 8)
        {
            Error = "La contraseña debe tener al menos 8 caracteres.";
            return Page();
        }
        if (NuevaPassword != ConfirmarPassword)
        {
            Error = "Las contraseñas no coinciden.";
            return Page();
        }

        var r = await _auth.RestablecerAsync(Token, NuevaPassword);
        if (!r.Exito)
        {
            Error = r.Error;
            return Page();
        }

        Exito = true;
        return Page();
    }
}
