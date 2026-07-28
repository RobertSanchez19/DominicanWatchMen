using RelojRazor.Models;

namespace RelojRazor.Interfaces
{
    // Contrato del carrito de compras. La implementacion guarda las lineas en la
    // sesion del usuario (seleccion temporal); se inyecta por DI en las Razor Pages.
    public interface ICarritoService
    {
        IReadOnlyList<CarritoItem> ObtenerItems();
        int CantidadTotal();
        decimal Total();

        // Agrega una linea; si ya existe la misma configuracion, suma la cantidad.
        void Agregar(CarritoItem item);

        // Quita una linea por su clave (relojId-movimientoId-tipoPulseraId).
        void Quitar(string clave);

        void Vaciar();
    }
}
