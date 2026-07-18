import React from 'react';
import { API } from '../../config/api.js';

// Modal de pedidos: el admin ve las ordenes y cambia su estado.
export default function PedidosModal({ onClose }) {
  const [pedidos, setPedidos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [abierto, setAbierto] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API}/api/pedido`).then(r => r.json()).then(d => { setPedidos(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fmt = (f) => { try { return new Date(f).toLocaleString('es-DO'); } catch (e) { return f; } };

  const estados = ['Pendiente', 'En proceso', 'Enviado', 'Completado', 'Cancelado'];
  const cambiarEstado = async (id, estado) => {
    try {
      const r = await fetch(`${API}/api/pedido/${id}/estado`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
      if (!r.ok) throw new Error();
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
    } catch (e) {}
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '30px 34px', width: '100%', maxWidth: 760, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Ordenes de compra</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>Pedidos ({pedidos.length})</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Cargando...</div>
          : pedidos.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)', fontSize: 13 }}>Aun no hay pedidos.</div>
          : pedidos.map(p => (
            <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
              <div onClick={() => setAbierto(abierto === p.id ? null : p.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', background: 'var(--off-white)' }}>
                <div>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Pedido #{p.id}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 10 }}>{p.nombreCliente} {p.apellidoCliente} · {fmt(p.fecha)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 9999, background: 'var(--gold-bg)', color: 'var(--gold)' }}>{p.estado}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>RD$ {p.total.toLocaleString('es-DO')}</span>
                </div>
              </div>
              {abierto === p.id && (
                <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                  {p.items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span>{i.relojNombre} <span style={{ color: 'var(--ink-4)' }}>({i.maquinaNombre} · {i.pulseraNombre}) x{i.cantidad}</span></span>
                      <span style={{ fontFamily: 'var(--mono)' }}>RD$ {i.subtotal.toLocaleString('es-DO')}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--ink)' }}>Envio:</strong> {p.direccion}, {p.ciudad}, {p.provincia} {p.codigoPostal}{p.referencia ? ` (${p.referencia})` : ''}<br />
                    <strong style={{ color: 'var(--ink)' }}>Contacto:</strong> {p.email} · {p.telefono} · <strong style={{ color: 'var(--ink)' }}>Pago:</strong> {p.metodoPago}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Cambiar estado:</span>
                    <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--white)', color: 'var(--ink)' }}>
                      {estados.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
