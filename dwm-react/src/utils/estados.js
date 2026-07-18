// Colores para los estados de pedidos y de tickets.
export const estadoColor = (e) => e === 'Completado' ? '#2D6A4F' : e === 'Cancelado' ? '#B23838' : e === 'Enviado' ? '#1B3461' : e === 'En proceso' ? '#A8862C' : 'var(--ink-3)';

export const estadoTicketColor = (e) => e === 'Resuelto' ? '#2D6A4F' : e === 'Cerrado' ? 'var(--ink-4)' : e === 'En progreso' ? '#1B3461' : 'var(--gold)';
