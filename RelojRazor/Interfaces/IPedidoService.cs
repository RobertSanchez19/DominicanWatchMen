using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato del servicio de pedidos (checkout). Habla con api/pedido.
    public interface IPedidoService
    {
        Task<(Pedido? Pedido, string? Error)> CrearPedidoAsync(CrearPedidoRequest request);
        Task<Pedido?> GetPedidoAsync(int id);
    }
}
