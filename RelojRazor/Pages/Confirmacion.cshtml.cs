using Microsoft.AspNetCore.Mvc.RazorPages;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Pages;

// Confirmación de la compra: muestra el pedido creado (número, desglose y estado).
public class ConfirmacionModel : PageModel
{
    private readonly IPedidoService _pedidos;

    public ConfirmacionModel(IPedidoService pedidos) => _pedidos = pedidos;

    public Pedido? Pedido { get; private set; }

    public async Task OnGetAsync(int id)
    {
        Pedido = await _pedidos.GetPedidoAsync(id);
    }
}
