import React from 'react';
import { API } from '../../config/api.js';

// Modal de componentes: inventario propio de maquinas y pulseras (stock + precio extra).
export default function ComponentesModal({ onClose, onCambio }) {
  const [maquinas, setMaquinas] = React.useState([]);
  const [pulseras, setPulseras] = React.useState([]);
  const [msg, setMsg]           = React.useState(null);
  const [loading, setLoading]   = React.useState(true);

  const cargar = () => {
    Promise.all([
      fetch(`${API}/api/movimiento`).then(r => r.json()),
      fetch(`${API}/api/tipopulsera`).then(r => r.json()),
    ]).then(([m, p]) => { setMaquinas(m); setPulseras(p); setLoading(false); })
      .catch(() => { setMsg({ ok: false, texto: 'Error al cargar' }); setLoading(false); });
  };
  React.useEffect(() => { cargar(); }, []);

  const setCampo = (tipo, id, campo, valor) => {
    const num = campo === 'stock' ? parseInt(valor || 0) : parseFloat(valor || 0);
    const upd = prev => prev.map(x => x.id === id ? { ...x, [campo]: isNaN(num) ? 0 : num } : x);
    if (tipo === 'maquina') setMaquinas(upd); else setPulseras(upd);
  };

  const guardar = async (tipo, item) => {
    setMsg(null);
    const url = tipo === 'maquina' ? `${API}/api/movimiento/${item.id}` : `${API}/api/tipopulsera/${item.id}`;
    try {
      const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
      if (!r.ok) throw new Error('Error al guardar');
      setMsg({ ok: true, texto: `${item.nombre} actualizado` }); onCambio();
    } catch (err) { setMsg({ ok: false, texto: err.message }); }
  };

  const inpm = { width: 66, padding: '6px 8px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--mono)', boxSizing: 'border-box' };

  const tabla = (titulo, items, tipo) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>{titulo}</div>
      {items.map(it => (
        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{it.nombre}</span>
          <label style={{ fontSize: 8, color: 'var(--ink-4)', textTransform: 'uppercase' }}>Stock <input type="number" min="0" value={it.stock} onChange={e => setCampo(tipo, it.id, 'stock', e.target.value)} style={inpm} /></label>
          <label style={{ fontSize: 8, color: 'var(--ink-4)', textTransform: 'uppercase' }}>+RD$ <input type="number" min="0" step="0.01" value={it.precioExtra} onChange={e => setCampo(tipo, it.id, 'precioExtra', e.target.value)} style={inpm} /></label>
          <button onClick={() => guardar(tipo, it)} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '6px 12px', cursor: 'pointer' }}>Guardar</button>
        </div>
      ))}
    </div>
  );

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '30px 34px', width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Inventario de componentes</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>Maquinas y pulseras</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 18 }}>Cada componente tiene su propio stock. Un reloj se arma mientras haya base, maquina y pulsera disponibles.</p>
        {msg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626' }}>{msg.texto}</div>}
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Cargando...</div> : (<>{tabla('Maquinas', maquinas, 'maquina')}{tabla('Pulseras', pulseras, 'pulsera')}</>)}
      </div>
    </div>
  );
}
