import React from 'react';
import Estrellas from './Estrellas.jsx';
import { getResenas, puedeResenar, addResena } from '../services/api.js';

// Seccion de reseñas de un reloj: promedio, lista y formulario.
// Solo puede reseñar quien compro el reloj (se verifica con el API).
export default function ResenasReloj({ reloj, usuario }) {
  const [resenas, setResenas]     = React.useState(reloj.resenas || []);
  const [calif, setCalif]         = React.useState(5);
  const [comentario, setComentario] = React.useState('');
  const [msg, setMsg]             = React.useState(null);
  const [puede, setPuede]         = React.useState(false);
  const cargar = () => getResenas(reloj.id).then(setResenas).catch(() => {});
  React.useEffect(() => { cargar(); }, []);
  React.useEffect(() => {
    if (!usuario) { setPuede(false); return; }
    puedeResenar(usuario.id, reloj.id).then(d => setPuede(!!d.puede)).catch(() => setPuede(false));
  }, [usuario, reloj.id]);
  const promedio = resenas.length ? resenas.reduce((s, r) => s + r.calificacion, 0) / resenas.length : 0;
  const enviar = async (e) => {
    e.preventDefault(); setMsg(null);
    const { ok } = await addResena({ relojId: reloj.id, usuarioId: usuario.id, nombreCliente: `${usuario.nombre} ${usuario.apellido || ''}`.trim(), calificacion: calif, comentario });
    if (ok) { setComentario(''); setMsg({ ok: true, texto: 'Gracias por tu reseña' }); cargar(); }
    else { setMsg({ ok: false, texto: 'Error al enviar' }); }
  };
  return (
    <div style={{ padding: '20px 34px 28px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Reseñas</div>
        {resenas.length > 0 && <><Estrellas valor={promedio} /><span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{promedio.toFixed(1)} · {resenas.length} reseña{resenas.length !== 1 ? 's' : ''}</span></>}
      </div>
      {resenas.length === 0 ? <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 14 }}>Aun no hay reseñas. ¡Se el primero!</p>
        : <div style={{ marginBottom: 16 }}>{resenas.map(r => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Estrellas valor={r.calificacion} tam={11} /><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)' }}>{r.nombreCliente}</span></div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 4 }}>{r.comentario}</p>
            </div>
          ))}</div>}
      {usuario && puede && (
        <form onSubmit={enviar} style={{ background: 'var(--off-white)', borderRadius: 8, padding: '14px 16px' }}>
          {msg && <div style={{ fontSize: 11, marginBottom: 8, color: msg.ok ? '#2D6A4F' : 'var(--rose)' }}>{msg.texto}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Tu calificacion:</span>
            <Estrellas valor={calif} tam={18} onClick={setCalif} />
          </div>
          <textarea value={comentario} onChange={e => setComentario(e.target.value)} required rows={2} placeholder="Escribe tu opinion..." style={{ width: '100%', padding: '9px 11px', border: '1px solid var(--border-dk)', borderRadius: 6, fontSize: 12.5, fontFamily: 'var(--sans)', boxSizing: 'border-box', resize: 'vertical' }} />
          <button type="submit" style={{ marginTop: 8, padding: '9px 20px', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Enviar reseña</button>
        </form>
      )}
    </div>
  );
}
