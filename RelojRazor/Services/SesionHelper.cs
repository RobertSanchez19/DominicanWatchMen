using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Centraliza la creacion de la sesion (cookie) a partir del usuario del API.
    public static class SesionHelper
    {
        public static async Task IniciarSesionAsync(HttpContext ctx, Usuario u, bool recordar)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, u.Id.ToString()),
                new(ClaimTypes.Name, $"{u.Nombre} {u.Apellido}".Trim()),
                new(ClaimTypes.Email, u.Email),
                new(ClaimTypes.Role, string.IsNullOrWhiteSpace(u.Rol) ? "Cliente" : u.Rol),
                new("Nombre", u.Nombre),
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            var props = new AuthenticationProperties
            {
                IsPersistent = recordar,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(4)
            };

            await ctx.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, props);
        }

        public static async Task CerrarSesionAsync(HttpContext ctx)
        {
            await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }
}
