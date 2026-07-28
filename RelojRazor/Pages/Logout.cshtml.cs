using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Services;

namespace RelojRazor.Pages;

// Cierra la sesion (elimina la cookie) y vuelve al inicio.
public class LogoutModel : PageModel
{
    public async Task<IActionResult> OnGetAsync()
    {
        await SesionHelper.CerrarSesionAsync(HttpContext);
        return RedirectToPage("/Index");
    }

    public async Task<IActionResult> OnPostAsync()
    {
        await SesionHelper.CerrarSesionAsync(HttpContext);
        return RedirectToPage("/Index");
    }
}
