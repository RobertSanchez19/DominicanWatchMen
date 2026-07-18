import React from 'react';
import Emblem from '../components/Emblem.jsx';
import HiloTicket from '../components/HiloTicket.jsx';
import { estadoTicketColor } from '../utils/estados.js';
import { getTickets } from '../services/api.js';

// Pagina del rol Soporte (y Admin): lista todos los tickets y abre el hilo.
export default function SoportePage({ usuario, onVolver }) {
  const [tickets, setTickets] = React.useState([]);
  const [filtro, setFiltro]   = React.useState('Todos');
  const [abierto, setAbierto] = React.useState(null);
  const cargar = () => getTickets().then(setTickets).catch(() => {});
  React.useEffect(() => { cargar(); }, []);
  const filtrados = filtro === 'Todos' ? tickets : tickets.filter(t => t.estado === filtro);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem size={30} fg="var(--gold)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Soporte al Cliente</div>
        </div>
        <button onClick={onVolver} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>← Tienda</button>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '30px 48px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {['Todos', 'Abierto', 'En progreso', 'Resuelto', 'Cerrado'].map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 9999, cursor: 'pointer', background: filtro === f ? 'var(--ink)' : 'transparent', color: filtro === f ? 'var(--white)' : 'var(--ink-3)', border: filtro === f ? '1px solid var(--ink)' : '1px solid var(--border-dk)' }}>{f}</button>
          ))}
        </div>
        {filtrados.length === 0 ? <div style={{ textAlign: 'center', padding: 50, color: 'var(--ink-4)', fontSize: 13, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12 }}>No hay tickets {filtro !== 'Todos' ? `en estado "${filtro}"` : 'todavia'}.</div>
          : filtrados.map(t => (
            <div key={t.id} onClick={() => setAbierto(t.id)} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', marginBottom: 10, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{t.asunto}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>#{t.id} · {t.nombreCliente}{t.pedidoId ? ` · Pedido #${t.pedidoId}` : ''} · Prioridad {t.prioridad} · {t.mensajes.length} msg</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 9999, color: 'var(--white)', background: estadoTicketColor(t.estado) }}>{t.estado}</span>
            </div>
          ))}
      </div>
      {abierto && <HiloTicket ticketId={abierto} autor={usuario.nombre} esSoporte={true} permiteEstado={true} onClose={() => setAbierto(null)} onCambio={cargar} />}
    </div>
  );
}
