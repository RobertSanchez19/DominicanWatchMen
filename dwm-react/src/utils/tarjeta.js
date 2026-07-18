// ============================================================
// Utilidades de TARJETA (deteccion por prefijo/BIN, sin API externa).
// Solo para demostracion: los datos no se guardan ni se envian.
// ============================================================
export const TARJETAS = [
  { marca: 'Visa',       patron: /^4/,               formato: [4, 4, 4, 4], largo: 16, cvv: 3, color: '#1a1f71', indicador: 'Empieza con 4',        demo: '4242 4242 4242 4242' },
  { marca: 'Mastercard', patron: /^(5[1-5]|2[2-7])/, formato: [4, 4, 4, 4], largo: 16, cvv: 3, color: '#eb001b', indicador: '51–55 o 2221–2720',    demo: '5555 5555 5555 4444' },
  { marca: 'Amex',       patron: /^3[47]/,           formato: [4, 6, 5],    largo: 15, cvv: 4, color: '#2e77bc', indicador: '34 o 37',              demo: '3782 822463 10005' },
];

// Detecta la marca segun el prefijo (BIN) del numero.
export function detectarMarca(valor) {
  const d = (valor || '').replace(/\D/g, '');
  return TARJETAS.find(t => t.patron.test(d)) || null;
}

// Formatea el numero en grupos segun la marca (ej. Amex 4-6-5).
export function formatearTarjeta(valor) {
  const marca = detectarMarca(valor);
  const largo = marca ? marca.largo : 16;
  const digitos = (valor || '').replace(/\D/g, '').slice(0, largo);
  const grupos = marca ? marca.formato : [4, 4, 4, 4];
  let out = '', idx = 0;
  for (const g of grupos) {
    if (idx >= digitos.length) break;
    out += (out ? ' ' : '') + digitos.slice(idx, idx + g);
    idx += g;
  }
  if (idx < digitos.length) out += (out ? ' ' : '') + digitos.slice(idx);
  return out;
}

// Algoritmo de Luhn: valida el formato del numero (atrapa errores de tipeo).
export function luhnValido(valor) {
  const d = (valor || '').replace(/\D/g, '');
  if (d.length < 13) return false;
  let suma = 0, alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = parseInt(d[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    suma += n; alt = !alt;
  }
  return suma % 10 === 0;
}

// Formatea el vencimiento a MM/AA en vivo (ej. 0828 -> 08/28).
export function formatearVence(valor) {
  const d = (valor || '').replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return d.slice(0, 2) + '/' + d.slice(2);
}
