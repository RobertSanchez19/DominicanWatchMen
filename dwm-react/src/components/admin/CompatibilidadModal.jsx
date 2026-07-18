import React from 'react';
import { API } from '../../config/api.js';

// Modal de compatibilidad: que maquinas y pulseras admite un reloj (modelo BOM).
export default function CompatibilidadModal({ reloj, onClose, onCambio }) {
  const [maquinas, setMaquinas] = React.useState([]);
  const [pulseras, setPulseras] = React.useState([]);
  const [selMaq, setSelMaq]     = React.useState({});
  const [selPul, setSelPul]     = React.useState({});
  const [msg, setMsg]           = React.useState(null);
  const [loading, setLoading]   = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch(`${API}/api/movimiento`).then(r => r.json()),
      fetch(`${API}/api/tipopulsera`).then(r => r.json()),
      fetch(`${API}/api/reloj/${reloj.id}`).then(r => r.json()),
    ]).then(([m, p, r]) => {
      setMaquinas(m); setPulseras(p);
      const sm = {}; (r.movimientosCompatibles || []).forEach(x => sm[x.id] = true); setSelMaq(sm);
      const sp = {}; (r.pulserasCompatibles || []).forEach(x => sp[x.id] = true); setSelPul(sp);
      setLoading(false);
    }).catch(() => { setMsg({ ok: false, texto: 'Error al cargar' }); setLoading(false); });
  }, []);

  const toggle = (setter, id) => setter(prev => ({ ...prev, [id]: !prev[id] }));

  const guardar = async () => {
    setMsg(null);
    const payload = {
      movimientoIds: Object.keys(selMaq).filter(k => selMaq[k]).map(Number),
      tipoPulseraIds: Object.keys(selPul).filter(k => selPul[k]).map(Number),
    };
    try {
      const r = await fetch(`${API}/api/reloj/${reloj.id}/compatibilidad`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('Error al guardar');
      setMsg({ ok: true, texto: 'Compatibilidad guardada' }); onCambio();
    } catch (err) { setMsg({ ok: false, texto: err.message }); }
  };

  const fila = (item, checked, onToggle) => (
    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: checked ? 'var(--gold-bg)' : 'transparent', border: `1px solid ${checked ? 'var(--gold-lt)' : 'var(--border)'}`, marginBottom: 6 }}>
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{item.nombre}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink-4)' }}>{item.precioExtra > 0 ? `+${item.precioExtra.toLocaleString('es-DO')}` : 'incl'} · stk{item.stock}</span>
    </label>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '30px 34px', width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Opciones compatibles</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>{reloj.nombre}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 18 }}>Elige que maquinas y pulseras admite este modelo. El stock de cada pieza se gestiona en "Componentes".</p>

        {msg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626' }}>{msg.texto}</div>}

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Cargando...</div> : (
          <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Maquinas</div>
              {maquinas.map(m => fila(m, !!selMaq[m.id], () => toggle(setSelMaq, m.id)))}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Pulseras</div>
              {pulseras.map(p => fila(p, !!selPul[p.id], () => toggle(setSelPul, p.id)))}
            </div>
          </div>
        )}

        <button onClick={guardar} style={{ marginTop: 24, width: '100%', padding: '13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Guardar compatibilidad</button>
      </div>
    </div>
  );
}
