import React from 'react';
import Estrellas from './Estrellas.jsx';
import { addResena } from '../services/api.js';

// Linea de un pedido con opcion de dejar/actualizar la reseña de ese reloj.
export default function PedidoItemResena({ item, usuario }) {
  const [open, setOpen]           = React.useState(false);
  const [calif, setCalif]         = React.useState(5);
  const [comentario, setComentario] = React.useState('');
  const [msg, setMsg]             = React.useState(null);
  const [enviada, setEnviada]     = React.useState(false);

  const enviar = async (e) => {
    e.preventDefault(); setMsg(null);
    const { ok, data } = await addResena({ relojId: item.relojId, usuarioId: usuario.id, nombreCliente: `${usuario.nombre} ${usuario.apellido || ''}`.trim(), calificacion: calif, comentario });
    if (ok) { setEnviada(true); setOpen(false); }
    else setMsg({ ok: false, texto: data.mensaje || 'Error al enviar la reseña' });
  };

  return (
    <div style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{item.relojNombre} <span style={{ color: 'var(--ink-4)' }}>({item.maquinaNombre} · {item.pulseraNombre}) x{item.cantidad}</span></span>
        <span style={{ fontFamily: 'var(--mono)' }}>RD$ {item.subtotal.toLocaleString('es-DO')}</span>
      </div>
      {enviada ? (
        <div style={{ fontSize: 11, color: '#2D6A4F', marginTop: 4 }}>Reseña enviada. ¡Gracias!</div>
      ) : open ? (
        <form onSubmit={enviar} style={{ background: 'var(--off-white)', borderRadius: 8, padding: '10px 12px', marginTop: 6 }}>
          {msg && <div style={{ fontSize: 11, marginBottom: 6, color: 'var(--rose)' }}>{msg.texto}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Calificacion:</span>
            <Estrellas valor={calif} tam={16} onClick={setCalif} />
          </div>
          <textarea value={comentario} onChange={e => setComentario(e.target.value)} required rows={2} placeholder="Escribe tu opinion sobre este reloj..." style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border-dk)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--sans)', boxSizing: 'border-box', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="submit" style={{ padding: '7px 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Enviar reseña</button>
            <button type="button" onClick={() => setOpen(false)} style={{ padding: '7px 16px', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: 'none', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} style={{ marginTop: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--gold)', textDecoration: 'underline' }}>Dejar reseña</button>
      )}
    </div>
  );
}
