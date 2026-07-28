using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Services;

namespace RelojRazor.Pages;

// Registro de un cliente nuevo. Al crear la cuenta inicia sesion automaticamente.
public class RegistroModel : PageModel
{
    private readonly IAuthService _auth;

    public RegistroModel(IAuthService auth) => _auth = auth;

    [BindProperty] public RegistroInput Entrada { get; set; } = new();
    public string? Error { get; set; }

    public IActionResult OnGet()
    {
        if (User.Identity?.IsAuthenticated == true)
            return RedirectToPage("/Index");
        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        var (exito, error) = await _auth.RegistrarAsync(
            Entrada.Nombre, Entrada.Apellido, Entrada.Email, Entrada.Password,
            Entrada.Telefono, Entrada.Direccion);

        if (!exito)
        {
            Error = error;
            return Page();
        }

        // Inicia sesion inmediatamente con las credenciales recien creadas.
        var login = await _auth.LoginAsync(Entrada.Email, Entrada.Password);
        if (login.Exito && login.Usuario is not null)
        {
            await SesionHelper.IniciarSesionAsync(HttpContext, login.Usuario, false);
            return RedirectToPage("/Index");
        }

        return RedirectToPage("/Login");
    }

    public class RegistroInput
    {
        [Required(ErrorMessage = "El nombre es obligatorio")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "El correo es obligatorio")]
        [EmailAddress(ErrorMessage = "Correo no válido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es obligatoria")]
        [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Teléfono no válido")]
        public string? Telefono { get; set; }
        public string? Direccion { get; set; }
    }
}
