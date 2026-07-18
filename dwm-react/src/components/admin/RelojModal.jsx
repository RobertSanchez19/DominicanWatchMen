import React from 'react';
import { API } from '../../config/api.js';
import { getImageUrl } from '../../utils/getImageUrl.js';

// Modal para crear o editar un reloj (con subida de imagen).
export default function RelojModal({ modo, reloj, marcas, onClose, onGuardado }) {
  const [form, setForm]       = React.useState({
    nombre: reloj?.nombre || '', modelo: reloj?.modelo || '',
    precio: reloj?.precio || '', stock: reloj?.stock || '',
    marcaId: reloj?.marcaId || '', imagenUrl: reloj?.imagenUrl || '',
    tipoModelo: reloj?.tipoModelo || '',
  });
  const [imagen, setImagen]   = React.useState(null);
  const [preview, setPreview] = React.useState(reloj?.imagenUrl ? getImageUrl(reloj.imagenUrl) : null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      let imagenUrl = form.imagenUrl;
      if (imagen) {
        const fd = new FormData(); fd.append('archivo', imagen);
        const upRes = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
        if (!upRes.ok) throw new Error('Error al subir imagen');
        imagenUrl = (await upRes.json()).url;
      }
      const url    = modo === 'crear' ? `${API}/api/reloj` : `${API}/api/reloj/${reloj.id}`;
      const method = modo === 'crear' ? 'POST' : 'PUT';
      const saveRes = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock), marcaId: parseInt(form.marcaId), imagenUrl }),
      });
      if (!saveRes.ok) throw new Error('Error al guardar');
      onGuardado();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 13px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '36px 40px', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>{modo === 'crear' ? 'Nuevo Reloj' : 'Editar Reloj'}</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)' }}>{modo === 'crear' ? 'Agregar a la Colección' : reloj.nombre}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)', padding: 4 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Marca</label>
            <select value={form.marcaId} onChange={e => setForm({...form, marcaId: e.target.value})} required style={inp}>
              <option value="">Selecciona una marca</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Nombre</label>
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required placeholder="Submariner Mod" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Modelo</label>
            <input value={form.modelo} onChange={e => setForm({...form, modelo: e.target.value})} required placeholder="NH35-SUB-BK" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Tipo de modelo (sugiere pulseras)</label>
            <select value={form.tipoModelo} onChange={e => setForm({...form, tipoModelo: e.target.value})} style={inp}>
              <option value="">Sin especificar</option>
              <option value="Diver">Diver (buceo)</option>
              <option value="GMT">GMT</option>
              <option value="Dress">Dress (vestir)</option>
              <option value="Field">Field (campo)</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div><label style={lbl}>Precio base (RD$)</label><input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} required min="0" step="0.01" placeholder="12500" style={inp} /></div>
            <div><label style={lbl}>Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required min="0" placeholder="5" style={inp} /></div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Imagen</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', border: '1px dashed var(--border-dk)', borderRadius: 4, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-dk)'}>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f){ setImagen(f); setPreview(URL.createObjectURL(f)); }}} style={{ display: 'none' }} />
              {preview
                ? <img src={preview} style={{ height: 56, width: 56, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} />
                : <div style={{ width: 56, height: 56, borderRadius: 6, background: 'var(--warm-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--ink-4)' }}>+</div>
              }
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{imagen ? imagen.name : (preview ? 'Imagen actual · Clic para cambiar' : 'Seleccionar imagen')}</span>
            </label>
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
              {loading ? 'Guardando...' : (modo === 'crear' ? 'Agregar Reloj' : 'Guardar Cambios')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
