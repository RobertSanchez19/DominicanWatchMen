// Funciones JavaScript propias del sitio Dominican Watch Men.
// Se llaman desde las paginas Blazor (C#) mediante IJSRuntime (interoperabilidad JS <-> C#).
window.dwm = {
    // Muestra un aviso al usuario usando JavaScript del navegador.
    notificar: function (mensaje) {
        window.alert(mensaje);
    },
    // Pide confirmacion y DEVUELVE un valor (true/false) de vuelta a C#.
    confirmar: function (mensaje) {
        return window.confirm(mensaje);
    }
};
