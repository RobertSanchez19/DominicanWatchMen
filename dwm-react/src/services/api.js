// ============================================================
// SERVICIO DEL API
// Aqui se concentran TODAS las llamadas al backend. Las paginas y
// componentes NO usan fetch directo: le piden los datos a este servicio.
// La URL base viene de config/api.js (que la lee del .env).
// ============================================================
import { API } from '../config/api.js';

// GET: lista de relojes del catalogo
export async function getRelojes() {
  const res = await fetch(`${API}/api/reloj`);
  if (!res.ok) throw new Error('Error al conectar con la API');
  return res.json();
}

// GET: ids de los relojes favoritos de un usuario
export async function getFavoritos(usuarioId) {
  const res = await fetch(`${API}/api/favorito?usuarioId=${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar favoritos');
  return res.json();
}

// POST: marcar un reloj como favorito
export async function addFavorito(usuarioId, relojId) {
  await fetch(`${API}/api/favorito`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuarioId, relojId }),
  });
}

// DELETE: quitar un reloj de favoritos
export async function removeFavorito(usuarioId, relojId) {
  await fetch(`${API}/api/favorito?usuarioId=${usuarioId}&relojId=${relojId}`, { method: 'DELETE' });
}

// ----- Reseñas -----

// GET: reseñas de un reloj
export async function getResenas(relojId) {
  const res = await fetch(`${API}/api/resena?relojId=${relojId}`);
  if (!res.ok) throw new Error('Error al cargar reseñas');
  return res.json();
}

// GET: ¿este usuario puede reseñar este reloj? (solo si lo compró)
export async function puedeResenar(usuarioId, relojId) {
  const res = await fetch(`${API}/api/resena/puede-resenar?usuarioId=${usuarioId}&relojId=${relojId}`);
  if (!res.ok) throw new Error('Error al verificar');
  return res.json();
}

// POST: enviar una reseña. Devuelve { ok, data } para manejar el mensaje del backend.
export async function addResena(payload) {
  const res = await fetch(`${API}/api/resena`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = {};
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  return { ok: res.ok, data };
}

// ----- Cupones y pedidos (checkout) -----

// GET: valida un cupon por su codigo. Lanza error si es invalido o expiro.
export async function validarCupon(codigo) {
  const res = await fetch(`${API}/api/cupon/validar/${encodeURIComponent(codigo)}`);
  if (!res.ok) throw new Error('Cupon invalido o expirado');
  return res.json();
}

// POST: crea un pedido (checkout). Devuelve { ok, data }.
export async function crearPedido(payload) {
  const res = await fetch(`${API}/api/pedido`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = {};
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  return { ok: res.ok, data };
}

// Helper interno para POST con JSON que devuelve { ok, data }.
async function postJson(ruta, payload) {
  const res = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  let data = {};
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  return { ok: res.ok, data };
}

// ----- Autenticacion -----

// POST: login. Puede devolver { requiere2FA: true, ... } si el usuario tiene 2FA.
export function login(loginForm)             { return postJson('/api/usuario/login', loginForm); }
export function verificar2FA(usuarioId, codigo) { return postJson('/api/usuario/verificar-2fa', { usuarioId, codigo }); }
export function recuperar(email)             { return postJson('/api/usuario/recuperar', { email }); }
export function restablecer(token, nuevaPassword) { return postJson('/api/usuario/restablecer', { token, nuevaPassword }); }
export function registro(payload)            { return postJson('/api/usuario/registro', payload); }

// ----- Admin (crear reloj desde el panel de cuenta) -----

export async function getMarcas() {
  const res = await fetch(`${API}/api/marca`);
  if (!res.ok) throw new Error('Error al cargar marcas');
  return res.json();
}

// POST multipart: sube una imagen y devuelve su URL.
export async function uploadImagen(file) {
  const fd = new FormData(); fd.append('archivo', file);
  const res = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Error al subir la imagen');
  return res.json();
}

export function crearReloj(payload) { return postJson('/api/reloj', payload); }

// ----- Perfil / pedidos / tarjetas -----

export function actualizarPerfil(usuarioId, payload) {
  return fetch(`${API}/api/usuario/${usuarioId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(async res => ({ ok: res.ok, data: await res.json().catch(() => ({})) }));
}
export async function getPedidos(usuarioId) {
  const res = await fetch(`${API}/api/pedido?usuarioId=${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
}
export async function getTarjetas(usuarioId) {
  const res = await fetch(`${API}/api/tarjeta?usuarioId=${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar tarjetas');
  return res.json();
}
export function guardarTarjeta(payload) { return postJson('/api/tarjeta', payload); }
export async function borrarTarjeta(id) { await fetch(`${API}/api/tarjeta/${id}`, { method: 'DELETE' }); }

// ----- Tickets de soporte -----

export async function getTickets(usuarioId) {
  const url = usuarioId ? `${API}/api/ticket?usuarioId=${usuarioId}` : `${API}/api/ticket`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar tickets');
  return res.json();
}
export async function getTicket(id) {
  const res = await fetch(`${API}/api/ticket/${id}`);
  if (!res.ok) throw new Error('Error al cargar el ticket');
  return res.json();
}
export function crearTicket(payload) { return postJson('/api/ticket', payload); }
export function agregarMensajeTicket(id, payload) { return postJson(`/api/ticket/${id}/mensaje`, payload); }
export async function cambiarEstadoTicket(id, estado) {
  await fetch(`${API}/api/ticket/${id}/estado`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
}
