import React from 'react';

// Selector de cantidad con estado (useState). Respeta el stock (max) y
// avisa al padre la cantidad elegida con onCantidad.
export default function Contador({ precio = 0, max = Infinity, onCantidad }) {
  const [cantidad, setCantidad] = React.useState(1);
  // Si cambia el tope (otro componente/stock), ajusta la cantidad para no pasarse del stock
  React.useEffect(() => { setCantidad(c => Math.min(Math.max(1, c), Math.max(1, max))); }, [max]);
  // Reporta la cantidad al padre (para agregar al carrito con la cantidad elegida)
  React.useEffect(() => { if (onCantidad) onCantidad(cantidad); }, [cantidad]);
  const btn = { width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--border-dk)', background: 'var(--white)', color: 'var(--ink)', fontSize: 20, fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };
  const hoverOn  = e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; };
  const hoverOff = e => { e.currentTarget.style.borderColor = 'var(--border-dk)'; e.currentTarget.style.color = 'var(--ink)'; };
  const enTope = cantidad >= max;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 22 }}>
        <button style={btn} onClick={() => setCantidad(c => Math.max(1, c - 1))} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>−</button>
        <div style={{ textAlign: 'center', minWidth: 84 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 46, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{cantidad}</div>
          <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-4)', marginTop: 6 }}>{cantidad === 1 ? 'Pieza' : 'Piezas'}</div>
        </div>
        <button style={{ ...btn, opacity: enTope ? 0.35 : 1, cursor: enTope ? 'not-allowed' : 'pointer' }} disabled={enTope} onClick={() => setCantidad(c => Math.min(max, c + 1))} onMouseEnter={e => { if (!enTope) hoverOn(e); }} onMouseLeave={hoverOff}>+</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total estimado</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>RD$ {(precio * cantidad).toLocaleString('es-DO')}</span>
      </div>
      <button onClick={() => setCantidad(1)} style={{ marginTop: 16, width: '100%', padding: '11px', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Reiniciar</button>
    </div>
  );
}
