import React from 'react';
import { API } from '../config/api.js';
import { getImageUrl } from '../utils/getImageUrl.js';
import Emblem from '../components/Emblem.jsx';

const CATEGORIAS_PIEZA = ['Case', 'Dial', 'Bezel', 'Aguja', 'Maquina', 'Pulsera'];

// Taller de fabricacion: inventario de piezas (CRUD), inventario de venta
// (solo lectura) y publicar un reloj consumiendo piezas del taller.
export default function FabricacionPage({ usuario, onVolver }) {
  const [tab, setTab] = React.useState('piezas');
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 5 };
  const field = (label, node) => <div style={{ marginBottom: 12 }}>{label && <label style={lbl}>{label}</label>}{node}</div>;

  const subirImagen = async (file) => {
    const fd = new FormData(); fd.append('archivo', file);
    const r = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
    if (!r.ok) throw new Error('Error al subir imagen');
    return (await r.json()).url;
  };

  // ---- Piezas ----
  const [piezas, setPiezas]   = React.useState([]);
  const [filtro, setFiltro]   = React.useState('Todas');
  const [pForm, setPForm]     = React.useState({ id: null, categoria: 'Case', nombre: '', tipo: '', color: '', material: '', stock: '', imagenUrl: '' });
  const [pPrev, setPPrev]     = React.useState(null);
  const [msgP, setMsgP]       = React.useState(null);
  const pset = (k, v) => setPForm(f => ({ ...f, [k]: v }));
  const cargarPiezas = () => { fetch(`${API}/api/pieza`).then(r => r.json()).then(setPiezas).catch(() => {}); };
  React.useEffect(() => { cargarPiezas(); }, []);
  const limpiarP = () => { setPForm({ id: null, categoria: 'Case', nombre: '', tipo: '', color: '', material: '', stock: '', imagenUrl: '' }); setPPrev(null); };
  const editarP = (p) => { setPForm({ id: p.id, categoria: p.categoria, nombre: p.nombre, tipo: p.tipo, color: p.color, material: p.material, stock: String(p.stock), imagenUrl: p.imagenUrl || '' }); setPPrev(p.imagenUrl ? getImageUrl(p.imagenUrl) : null); };
  const guardarPieza = async (e) => {
    e.preventDefault(); setMsgP(null);
    try {
      const payload = { ...pForm, stock: parseInt(pForm.stock || 0) };
      const url = pForm.id ? `${API}/api/pieza/${pForm.id}` : `${API}/api/pieza`;
      const method = pForm.id ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('Error al guardar');
      setMsgP({ ok: true, texto: pForm.id ? 'Pieza actualizada' : 'Pieza agregada' }); limpiarP(); cargarPiezas();
    } catch (err) { setMsgP({ ok: false, texto: err.message }); }
  };
  const borrarPieza = async (id) => { await fetch(`${API}/api/pieza/${id}`, { method: 'DELETE' }); if (pForm.id === id) limpiarP(); cargarPiezas(); };
  const piezasFiltradas = filtro === 'Todas' ? piezas : piezas.filter(p => p.categoria === filtro);

  // ---- Inventario de venta (solo lectura) ----
  const [relojes, setRelojes] = React.useState([]);
  const [maquinas, setMaquinas] = React.useState([]);
  const [pulseras, setPulseras] = React.useState([]);
  React.useEffect(() => {
    if (tab === 'venta') {
      fetch(`${API}/api/reloj`).then(r => r.json()).then(setRelojes).catch(() => {});
      fetch(`${API}/api/movimiento`).then(r => r.json()).then(setMaquinas).catch(() => {});
      fetch(`${API}/api/tipopulsera`).then(r => r.json()).then(setPulseras).catch(() => {});
    }
  }, [tab]);

  // ---- Publicar reloj ----
  const [marcas, setMarcas] = React.useState([]);
  const [pub, setPub] = React.useState({ nombre: '', modelo: '', marcaId: '', precio: '', tipoModelo: 'Diver', cantidad: '1', imagenUrl: '' });
  const [pubPrev, setPubPrev] = React.useState(null);
  const [consumo, setConsumo] = React.useState({});
  const [msgPub, setMsgPub] = React.useState(null);
  const pubset = (k, v) => setPub(f => ({ ...f, [k]: v }));
  React.useEffect(() => { if (tab === 'publicar') { fetch(`${API}/api/marca`).then(r => r.json()).then(setMarcas).catch(() => {}); if (piezas.length === 0) cargarPiezas(); } }, [tab]);
  const toggleConsumo = (id) => setConsumo(c => { const n = { ...c }; if (n[id] != null) delete n[id]; else n[id] = 1; return n; });
  const setConsumoQty = (id, q) => setConsumo(c => ({ ...c, [id]: Math.max(1, parseInt(q || 1)) }));
  const publicar = async (e) => {
    e.preventDefault(); setMsgPub(null);
    const items = Object.keys(consumo).map(id => ({ piezaId: parseInt(id), cantidadPorReloj: consumo[id] }));
    if (items.length === 0) { setMsgPub({ ok: false, texto: 'Selecciona al menos una pieza a consumir' }); return; }
    try {
      const payload = { nombre: pub.nombre, modelo: pub.modelo, marcaId: parseInt(pub.marcaId), precio: parseFloat(pub.precio), tipoModelo: pub.tipoModelo, cantidad: parseInt(pub.cantidad || 1), imagenUrl: pub.imagenUrl || null, piezas: items };
      const r = await fetch(`${API}/api/fabricacion/publicar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.mensaje || 'Error al publicar');
      setMsgPub({ ok: true, texto: `Publicado "${d.nombre}" (#${d.id}) x${pub.cantidad}. Piezas descontadas del taller.` });
      setPub({ nombre: '', modelo: '', marcaId: '', precio: '', tipoModelo: 'Diver', cantidad: '1', imagenUrl: '' }); setPubPrev(null); setConsumo({}); cargarPiezas();
    } catch (err) { setMsgPub({ ok: false, texto: err.message }); }
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px', color: tab === id ? 'var(--ink)' : 'var(--ink-4)', borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem size={30} fg="var(--gold)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Taller de Fabricacion</div>
        </div>
        <button onClick={onVolver} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>← Tienda</button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 48px' }}>
        <div style={{ display: 'flex', gap: 22, borderBottom: '1px solid var(--border)', marginBottom: 26 }}>
          {tabBtn('piezas', 'Inventario de piezas')}
          {tabBtn('venta', 'Inventario de venta')}
          {tabBtn('publicar', 'Publicar reloj')}
        </div>

        {/* ---- PIEZAS ---- */}
        {tab === 'piezas' && (
          <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 26, alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {['Todas', ...CATEGORIAS_PIEZA].map(c => (
                  <button key={c} onClick={() => setFiltro(c)} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '7px 13px', borderRadius: 9999, cursor: 'pointer', background: filtro === c ? 'var(--ink)' : 'transparent', color: filtro === c ? 'var(--white)' : 'var(--ink-3)', border: filtro === c ? '1px solid var(--ink)' : '1px solid var(--border-dk)' }}>{c}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                {piezasFiltradas.map(p => (
                  <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: 110, background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {getImageUrl(p.imagenUrl) && p.imagenUrl ? <img src={getImageUrl(p.imagenUrl)} alt={p.nombre} style={{ maxHeight: 100, maxWidth: '90%', objectFit: 'contain' }} /> : <Emblem size={34} fg="var(--border-dk)" />}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>{p.categoria}</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '2px 0' }}>{p.nombre}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{[p.tipo, p.color, p.material].filter(Boolean).join(' · ')}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: p.stock === 0 ? 'var(--rose)' : 'var(--ink)' }}>{p.stock} uds</span>
                        <span>
                          <button onClick={() => editarP(p)} style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '4px 8px', cursor: 'pointer', marginRight: 5 }}>Editar</button>
                          <button onClick={() => borrarPieza(p.id)} style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}>×</button>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={guardarPieza} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>{pForm.id ? 'Editar pieza' : 'Agregar pieza'}</div>
              {msgP && <div style={{ padding: '9px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12, background: msgP.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgP.ok ? '#bbf7d0' : '#fecaca'}`, color: msgP.ok ? '#166534' : '#dc2626' }}>{msgP.texto}</div>}
              {field('Categoria', <select value={pForm.categoria} onChange={e => pset('categoria', e.target.value)} style={inp}>{CATEGORIAS_PIEZA.map(c => <option key={c} value={c}>{c}</option>)}</select>)}
              {field('Nombre', <input value={pForm.nombre} onChange={e => pset('nombre', e.target.value)} required placeholder="Dial Sunburst Azul" style={inp} />)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {field('Tipo', <input value={pForm.tipo} onChange={e => pset('tipo', e.target.value)} placeholder="Sunburst" style={inp} />)}
                {field('Color', <input value={pForm.color} onChange={e => pset('color', e.target.value)} placeholder="Azul" style={inp} />)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {field('Material', <input value={pForm.material} onChange={e => pset('material', e.target.value)} placeholder="Laton" style={inp} />)}
                {field('Stock', <input type="number" min="0" value={pForm.stock} onChange={e => pset('stock', e.target.value)} required placeholder="10" style={inp} />)}
              </div>
              {field('Foto', <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px dashed var(--border-dk)', borderRadius: 4, cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; if (f) { try { const url = await subirImagen(f); pset('imagenUrl', url); setPPrev(URL.createObjectURL(f)); } catch (err) { setMsgP({ ok: false, texto: err.message }); } } }} style={{ display: 'none' }} />
                {pPrev ? <img src={pPrev} style={{ height: 40, objectFit: 'contain' }} /> : <span style={{ fontSize: 18, color: 'var(--ink-4)' }}>+</span>}
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pForm.imagenUrl ? 'Imagen lista' : 'Subir foto'}</span>
              </label>)}
              <div style={{ display: 'flex', gap: 10 }}>
                {pForm.id && <button type="button" onClick={limpiarP} style={{ flex: 1, padding: '11px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Cancelar</button>}
                <button type="submit" style={{ flex: 2, padding: '11px', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>{pForm.id ? 'Guardar' : 'Agregar pieza'}</button>
              </div>
            </form>
          </div>
        )}

        {/* ---- INVENTARIO DE VENTA ---- */}
        {tab === 'venta' && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 16, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
              Vista de solo lectura. Para tomar componentes de venta para el taller necesitas <strong style={{ color: 'var(--ink)' }}>autorizacion del administrador</strong>.
            </div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Relojes en venta</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginBottom: 24 }}>
              {relojes.map(r => (
                <div key={r.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.nombre}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: r.stock === 0 ? 'var(--rose)' : 'var(--ink)' }}>{r.stock}</span>
                </div>
              ))}
            </div>
            <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Maquinas (venta)</div>
                {maquinas.map(m => <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-2)' }}><span>{m.nombre}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{m.stock}</span></div>)}
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Pulseras (venta)</div>
                {pulseras.map(p => <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-2)' }}><span>{p.nombre}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{p.stock}</span></div>)}
              </div>
            </div>
          </div>
        )}

        {/* ---- PUBLICAR RELOJ ---- */}
        {tab === 'publicar' && (
          <form onSubmit={publicar} className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, alignItems: 'start' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 26px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Nuevo reloj (a venta)</div>
              {msgPub && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: msgPub.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgPub.ok ? '#bbf7d0' : '#fecaca'}`, color: msgPub.ok ? '#166534' : '#dc2626' }}>{msgPub.texto}</div>}
              {field('Nombre', <input value={pub.nombre} onChange={e => pubset('nombre', e.target.value)} required placeholder="Diver Custom Azul" style={inp} />)}
              {field('Modelo', <input value={pub.modelo} onChange={e => pubset('modelo', e.target.value)} placeholder="DWM-CUS-01" style={inp} />)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {field('Marca', <select value={pub.marcaId} onChange={e => pubset('marcaId', e.target.value)} required style={inp}><option value="">Selecciona</option>{marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}</select>)}
                {field('Tipo', <select value={pub.tipoModelo} onChange={e => pubset('tipoModelo', e.target.value)} style={inp}><option>Diver</option><option>GMT</option><option>Dress</option><option>Field</option></select>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {field('Precio (RD$)', <input type="number" min="0" step="0.01" value={pub.precio} onChange={e => pubset('precio', e.target.value)} required placeholder="16500" style={inp} />)}
                {field('Cantidad a producir', <input type="number" min="1" value={pub.cantidad} onChange={e => pubset('cantidad', e.target.value)} required style={inp} />)}
              </div>
              {field('Foto', <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px dashed var(--border-dk)', borderRadius: 4, cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; if (f) { try { const url = await subirImagen(f); pubset('imagenUrl', url); setPubPrev(URL.createObjectURL(f)); } catch (err) { setMsgPub({ ok: false, texto: err.message }); } } }} style={{ display: 'none' }} />
                {pubPrev ? <img src={pubPrev} style={{ height: 44, objectFit: 'contain' }} /> : <span style={{ fontSize: 18, color: 'var(--ink-4)' }}>+</span>}
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{pub.imagenUrl ? 'Imagen lista' : 'Subir foto'}</span>
              </label>)}
              <button type="submit" style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer', marginTop: 4 }}>Publicar reloj</button>
            </div>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Piezas a consumir (por reloj)</div>
              <p style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 12 }}>Se descuentan del taller: cantidad × piezas por reloj.</p>
              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {piezas.map(p => {
                  const sel = consumo[p.id] != null;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                      <input type="checkbox" checked={sel} onChange={() => toggleConsumo(p.id)} disabled={p.stock === 0} />
                      <span style={{ flex: 1, fontSize: 12, color: p.stock === 0 ? 'var(--ink-4)' : 'var(--ink)' }}>
                        <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginRight: 6 }}>{p.categoria}</span>
                        {p.nombre} <span style={{ color: 'var(--ink-4)' }}>(stk {p.stock})</span>
                      </span>
                      {sel && <input type="number" min="1" value={consumo[p.id]} onChange={e => setConsumoQty(p.id, e.target.value)} style={{ width: 54, padding: '5px 7px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--mono)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
