import React from 'react';
import { getImageUrl } from '../utils/getImageUrl.js';
import { estadoTicketColor } from '../utils/estados.js';
import { getTicket, agregarMensajeTicket, cambiarEstadoTicket, uploadImagen } from '../services/api.js';

// Modal de hilo de un ticket: lo usan el cliente y el soporte (props segun el rol).
export default function HiloTicket({ ticketId, autor, esSoporte, permiteEstado, onClose, onCambio }) {
  const [ticket, setTicket]   = React.useState(null);
  const [texto, setTexto]     = React.useState('');
  const [imagenUrl, setImg]   = React.useState('');
  const [prev, setPrev]       = React.useState(null);
  const estados = ['Abierto', 'En progreso', 'Resuelto', 'Cerrado'];

  const cargar = () => getTicket(ticketId).then(setTicket).catch(() => {});
  React.useEffect(() => { cargar(); }, []);

  const enviar = async (e) => {
    e.preventDefault(); if (!texto.trim()) return;
    await agregarMensajeTicket(ticketId, { autor, esSoporte, texto, imagenUrl: imagenUrl || null });
    setTexto(''); setImg(''); setPrev(null); cargar(); onCambio && onCambio();
  };
  const cambiarEstado = async (estado) => { await cambiarEstadoTicket(ticketId, estado); cargar(); onCambio && onCambio(); };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        {!ticket ? <div style={{ padding: 50, textAlign: 'center', color: 'var(--ink-4)' }}>Cargando...</div> : (
          <div>
            <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Ticket #{ticket.id}{ticket.pedidoId ? ` · Pedido #${ticket.pedidoId}` : ''}</div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{ticket.asunto}</h2>
                </div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 9999, color: 'var(--white)', background: estadoTicketColor(ticket.estado) }}>{ticket.estado}</span>
                <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>Prioridad: {ticket.prioridad} · {ticket.nombreCliente}</span>
                {permiteEstado && (
                  <select value={ticket.estado} onChange={e => cambiarEstado(e.target.value)} style={{ marginLeft: 'auto', padding: '5px 9px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 11, fontFamily: 'var(--sans)' }}>
                    {estados.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>{ticket.descripcion}</p>
              {ticket.imagenUrl && <img src={getImageUrl(ticket.imagenUrl)} alt="adjunto" style={{ marginTop: 10, maxHeight: 160, borderRadius: 8, border: '1px solid var(--border)' }} />}
            </div>

            <div style={{ padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ticket.mensajes.length === 0 && <p style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>Aun no hay respuestas.</p>}
              {ticket.mensajes.map(m => (
                <div key={m.id} style={{ alignSelf: m.esSoporte ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.esSoporte ? 'var(--gold)' : 'var(--ink-4)', marginBottom: 4, textAlign: m.esSoporte ? 'left' : 'right' }}>{m.esSoporte ? 'Soporte' : 'Cliente'} · {m.autor}</div>
                  <div style={{ background: m.esSoporte ? 'var(--gold-bg)' : 'var(--off-white)', border: `1px solid ${m.esSoporte ? 'var(--gold-lt)' : 'var(--border)'}`, borderRadius: 10, padding: '10px 13px', fontSize: 13, color: 'var(--ink)' }}>
                    {m.texto}
                    {m.imagenUrl && <img src={getImageUrl(m.imagenUrl)} alt="adjunto" style={{ display: 'block', marginTop: 8, maxHeight: 140, borderRadius: 6 }} />}
                  </div>
                </div>
              ))}
            </div>

            {ticket.estado !== 'Cerrado' && (
              <form onSubmit={enviar} style={{ padding: '14px 28px 24px', borderTop: '1px solid var(--border)' }}>
                <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder="Escribe una respuesta..." rows={2} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-dk)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--sans)', boxSizing: 'border-box', resize: 'vertical' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <label style={{ fontSize: 10, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="file" accept="image/*" onChange={async ev => { const f = ev.target.files[0]; if (f) { try { const u = await uploadImagen(f); setImg(u.url); setPrev(URL.createObjectURL(f)); } catch (e) {} } }} style={{ display: 'none' }} />
                    {prev ? <img src={prev} style={{ height: 30, borderRadius: 4 }} /> : <span style={{ border: '1px dashed var(--border-dk)', borderRadius: 4, padding: '5px 10px' }}>+ Imagen</span>}
                  </label>
                  <button type="submit" style={{ marginLeft: 'auto', padding: '9px 22px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Enviar</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
