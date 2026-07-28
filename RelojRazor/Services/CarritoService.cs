using System.Text.Json;
using RelojRazor.Interfaces;
using RelojRazor.Models;

namespace RelojRazor.Services
{
    // Carrito guardado en la sesion del usuario (ISession) serializando a JSON.
    // Se usa la sesion (no el API) porque el carrito es una seleccion temporal
    // antes de confirmar el pedido. Recibe IHttpContextAccessor por inyeccion.
    public class CarritoService : ICarritoService
    {
        private const string ClaveSesion = "DWM.Carrito";
        private readonly IHttpContextAccessor _http;

        public CarritoService(IHttpContextAccessor http) => _http = http;

        private ISession Session =>
            _http.HttpContext?.Session
            ?? throw new InvalidOperationException("La sesion no esta disponible.");

        private List<CarritoItem> Leer()
        {
            var json = Session.GetString(ClaveSesion);
            if (string.IsNullOrEmpty(json)) return new List<CarritoItem>();
            return JsonSerializer.Deserialize<List<CarritoItem>>(json) ?? new List<CarritoItem>();
        }

        private void Guardar(List<CarritoItem> items) =>
            Session.SetString(ClaveSesion, JsonSerializer.Serialize(items));

        public IReadOnlyList<CarritoItem> ObtenerItems() => Leer();

        public int CantidadTotal() => Leer().Sum(i => i.Cantidad);

        public decimal Total() => Leer().Sum(i => i.Subtotal);

        public void Agregar(CarritoItem item)
        {
            if (item.Cantidad < 1) item.Cantidad = 1;

            var items = Leer();
            // Misma configuracion (reloj + maquina + pulsera) -> sumamos cantidad.
            var existente = items.FirstOrDefault(i => i.Clave == item.Clave);
            if (existente is not null)
                existente.Cantidad += item.Cantidad;
            else
                items.Add(item);

            Guardar(items);
        }

        public void Quitar(string clave)
        {
            var items = Leer();
            items.RemoveAll(i => i.Clave == clave);
            Guardar(items);
        }

        public void Vaciar() => Session.Remove(ClaveSesion);
    }
}
