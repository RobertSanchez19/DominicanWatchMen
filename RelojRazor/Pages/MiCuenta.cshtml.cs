using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace RelojRazor.Pages;

// Muestra los datos de la sesion actual (protegida: requiere haber iniciado sesion).
public class MiCuentaModel : PageModel
{
    public string Nombre { get; private set; } = "";
    public string Email { get; private set; } = "";
    public string Rol { get; private set; } = "";

    public void OnGet()
    {
        Nombre = User.Identity?.Name ?? "";
        Email = User.FindFirstValue(ClaimTypes.Email) ?? "";
        Rol = User.FindFirstValue(ClaimTypes.Role) ?? "Cliente";
    }
}
