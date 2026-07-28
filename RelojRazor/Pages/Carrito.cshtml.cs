using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Carrito de compras: lista las configuraciones que el usuario fue anadiendo
// (guardadas en la sesion via ICarritoService) y permite quitarlas o vaciarlo.
public class CarritoModel : PageModel
{
    private readonly ICarritoService _carrito;

    public CarritoModel(ICarritoService carrito) => _carrito = carrito;

    // Datos que pasan del PageModel (.cshtml.cs) a la vista (.cshtml).
    public IReadOnlyList<CarritoItem> Items { get; private set; } = new List<CarritoItem>();
    public decimal Total { get; private set; }

    public void OnGet() => Cargar();

    public IActionResult OnPostQuitar(string clave)
    {
        _carrito.Quitar(clave);
        return RedirectToPage();
    }

    public IActionResult OnPostVaciar()
    {
        _carrito.Vaciar();
        return RedirectToPage();
    }

    private void Cargar()
    {
        Items = _carrito.ObtenerItems();
        Total = _carrito.Total();
    }
}
