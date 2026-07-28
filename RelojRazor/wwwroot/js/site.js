// ============================================================
//  site.js — funciones JavaScript del frente Razor
//  La pagina Contacto.cshtml invoca estas funciones.
// ============================================================

// Actualiza en vivo el contador de caracteres del mensaje.
function contarCaracteres(textarea, idContador, max) {
    const contador = document.getElementById(idContador);
    if (!contador) return;
    const usados = textarea.value.length;
    contador.textContent = usados + " / " + max + " caracteres";
    contador.style.color = usados > max ? "#dc2626" : "";
}

// Calcula una cotizacion rapida (cantidad x precio) sin recargar la pagina.
function calcularCotizacion() {
    const cantidad = parseInt(document.getElementById("cotCantidad").value) || 0;
    const precio = parseFloat(document.getElementById("cotPrecio").value) || 0;
    const total = cantidad * precio;
    const salida = document.getElementById("cotResultado");
    salida.textContent = "RD$ " + total.toLocaleString("es-DO", { minimumFractionDigits: 2 });
}

// ============================================================
//  Configurador de la pagina Detalle
//  Recalcula precio y disponibilidad en vivo al cambiar maquina/pulsera.
//  El servidor SIEMPRE vuelve a validar en el POST (esto es solo UX).
// ============================================================
function dwmConfigurar() {
    const cfg = document.getElementById("configurador");
    if (!cfg) return;

    const base = parseFloat(cfg.dataset.base) || 0;
    const baseStock = parseInt(cfg.dataset.basestock) || 0;

    const maq = cfg.querySelector('input[name="MovimientoId"]:checked');
    const pul = cfg.querySelector('input[name="TipoPulseraId"]:checked');
    if (!maq || !pul) return;

    // Precio = base + extra de la maquina + extra de la pulsera.
    const precio = base + (parseFloat(maq.dataset.extra) || 0) + (parseFloat(pul.dataset.extra) || 0);
    // Disponibilidad = minimo entre base, maquina y pulsera (se ensambla con 1 de cada uno).
    const disponible = Math.min(baseStock, parseInt(maq.dataset.stock) || 0, parseInt(pul.dataset.stock) || 0);

    const elPrecio = document.getElementById("cfgPrecio");
    const elDisp = document.getElementById("cfgDisp");
    const elCant = document.getElementById("cfgCantidad");
    const elBtn = document.getElementById("cfgBtn");

    if (elPrecio) elPrecio.textContent = "RD$ " + precio.toLocaleString("es-DO", { minimumFractionDigits: 2 });
    if (elDisp) elDisp.textContent = disponible > 0 ? disponible + " disponibles" : "Agotado";
    if (elCant) {
        elCant.max = disponible;
        if (parseInt(elCant.value) > disponible) elCant.value = disponible > 0 ? disponible : 1;
    }
    if (elBtn) elBtn.disabled = disponible <= 0;
}

// Valida el formulario de contacto en el navegador antes de enviarlo al servidor.
function validarContacto() {
    const nombre = document.getElementById("Contacto_Nombre");
    const email = document.getElementById("Contacto_Email");
    const mensaje = document.getElementById("Contacto_Mensaje");
    const errores = [];

    if (!nombre.value.trim()) errores.push("El nombre es obligatorio.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) errores.push("El correo no es valido.");
    if (mensaje.value.trim().length < 10) errores.push("El mensaje debe tener al menos 10 caracteres.");

    const caja = document.getElementById("erroresJs");
    if (errores.length > 0) {
        caja.innerHTML = "⚠ " + errores.join("<br>⚠ ");
        caja.style.display = "block";
        return false; // cancela el envio
    }
    caja.style.display = "none";
    return true; // permite el POST hacia el .cshtml.cs
}
