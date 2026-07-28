using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Gestion de usuarios y sus accesos (roles). Solo Admin (protegida por convencion).
public class UsuariosModel : PageModel
{
    private readonly IAuthService _auth;

    public UsuariosModel(IAuthService auth) => _auth = auth;

    public List<Usuario> Usuarios { get; private set; } = new();
    public string? Mensaje { get; set; }
    public string? Error { get; set; }

    // Roles disponibles en el sistema.
    public static readonly string[] Roles = { "Cliente", "Fabricante", "Soporte", "Admin" };

    public async Task OnGetAsync() => await CargarAsync();

    public async Task<IActionResult> OnPostRolAsync(int id, string rol)
    {
        if (!Roles.Contains(rol))
        {
            Error = "Rol no válido.";
            await CargarAsync();
            return Page();
        }

        var ok = await _auth.CambiarRolAsync(id, rol);
        Mensaje = ok ? "Rol actualizado correctamente." : null;
        Error = ok ? null : "No se pudo cambiar el rol.";
        await CargarAsync();
        return Page();
    }

    public async Task<IActionResult> OnPostDesactivarAsync(int id)
    {
        var ok = await _auth.DesactivarUsuarioAsync(id);
        Mensaje = ok ? "Usuario desactivado." : null;
        Error = ok ? null : "No se pudo desactivar el usuario.";
        await CargarAsync();
        return Page();
    }

    private async Task CargarAsync()
    {
        try
        {
            Usuarios = (await _auth.GetUsuariosAsync()).ToList();
        }
        catch (Exception)
        {
            Error ??= "No se pudo conectar con el API.";
        }
    }
}
