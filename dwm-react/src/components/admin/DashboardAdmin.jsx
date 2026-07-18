import React from 'react';
import { API } from '../../config/api.js';

// Dashboard del admin: metricas de ventas y alertas de stock bajo.
export default function DashboardAdmin() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => {
    Promise.all([
      fetch(`${API}/api/pedido`).then(r => r.json()),
      fetch(`${API}/api/reloj`).then(r => r.json()),
      fetch(`${API}/api/movimiento`).then(r => r.json()),
      fetch(`${API}/api/tipopulsera`).then(r => r.json()),
      fetch(`${API}/api/pieza`).then(r => r.json()),
    ]).then(([pedidos, relojes, maq, pul, piezas]) => setData({ pedidos, relojes, maq, pul, piezas })).catch(() => {});
  }, []);
  if (!data) return null;
  const { pedidos, relojes, maq, pul, piezas } = data;
  const ventas = pedidos.reduce((s, p) => s + p.total, 0);
  const unidades = pedidos.reduce((s, p) => s + (p.items || []).reduce((a, i) => a + i.cantidad, 0), 0);
  const porEstado = {};
  pedidos.forEach(p => { porEstado[p.estado] = (porEstado[p.estado] || 0) + 1; });
  const conteo = {};
  pedidos.forEach(p => (p.items || []).forEach(i => { conteo[i.relojNombre] = (conteo[i.relojNombre] || 0) + i.cantidad; }));
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const UMBRAL = 5;
  const bajo = [];
  relojes.forEach(r => { if ((r.stock || 0) <= UMBRAL) bajo.push({ t: 'Reloj (base)', n: r.nombre, s: r.stock }); });
  maq.forEach(m => { if (m.stock <= UMBRAL) bajo.push({ t: 'Maquina', n: m.nombre, s: m.stock }); });
  pul.forEach(p => { if (p.stock <= UMBRAL) bajo.push({ t: 'Pulsera', n: p.nombre, s: p.stock }); });
  piezas.forEach(p => { if (p.stock <= UMBRAL) bajo.push({ t: 'Pieza', n: p.nombre, s: p.stock }); });

  const card = (label, val, color) => (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: color || 'var(--ink)' }}>{val}</div>
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Resumen</div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {card('Ventas', 'RD$ ' + ventas.toLocaleString('es-DO'))}
        {card('Pedidos', pedidos.length)}
        {card('Unidades vendidas', unidades)}
        {card('Alertas stock bajo', bajo.length, bajo.length ? 'var(--rose)' : 'var(--ink)')}
      </div>
      <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Mas vendidos</div>
          {top.length === 0 ? <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sin ventas aun.</p> : top.map(([n, c]) => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5, color: 'var(--ink-2)' }}><span>{n}</span><span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{c}</span></div>
          ))}
        </div>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Stock bajo (5 o menos)</div>
          {bajo.length === 0 ? <p style={{ fontSize: 12, color: '#2D6A4F' }}>Todo con buen stock.</p> : (
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>{bajo.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12, color: 'var(--ink-2)' }}>
                <span><span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold)', marginRight: 6 }}>{b.t}</span>{b.n}</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: b.s === 0 ? 'var(--rose)' : 'var(--ink)' }}>{b.s}</span>
              </div>
            ))}</div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {Object.entries(porEstado).map(([e, c]) => (<span key={e} style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border)', borderRadius: 9999, padding: '5px 12px' }}>{e}: {c}</span>))}
      </div>
    </div>
  );
}
