// Arma la direccion (URL) de la imagen de un reloj.
// Si ya es un enlace http, lo deja igual; si no, le antepone el origen del sitio.
export function getImageUrl(imagenUrl) {
  if (!imagenUrl) return null;
  if (imagenUrl.startsWith('http')) return imagenUrl;
  return `${window.location.origin}/${imagenUrl}`;
}
