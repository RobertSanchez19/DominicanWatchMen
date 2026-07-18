// ============================================================
// CONFIGURACION DEL API
// La URL se lee de las variables de entorno (.env), NO se "quema"
// en el codigo. Asi, si cambia el servidor, se toca un solo lugar.
// ============================================================
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5157';
