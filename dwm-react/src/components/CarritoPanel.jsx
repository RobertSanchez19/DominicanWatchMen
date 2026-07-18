import Emblem from './Emblem.jsx';
import { getImageUrl } from '../utils/getImageUrl.js';

// Panel lateral del carrito con los items agregados y el total.
export default function CarritoPanel({ open, items, onClose, onQuitar, onVaciar, onCheckout }) {
  if (!open) return null;

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const unidades = items.reduce((s, i) => s + i.cantidad, 0);

  const cerrar = () => onClose();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={cerrar} style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,16,0.5)', backdropFilter: 'blur(6px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 420, maxWidth: '100%', height: '100%', background: 'var(--white)', boxShadow: '-24px 0 60px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '26px 30px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Tu seleccion</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>Carrito</div>
          </div>
          <button onClick={cerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-3)' }}>✕</button>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 30px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 70, color: 'var(--ink-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.5 }}><Emblem size={44} fg="var(--border-dk)" /></div>
              <p style={{ fontSize: 13, marginBottom: 20 }}>Tu carrito esta vacio.<br />Elige un reloj y personalizalo.</p>
              <button onClick={onClose} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '11px 24px', cursor: 'pointer' }}>Seguir comprando</button>
            </div>
          ) : (
            items.map(i => (
              <div key={i.key} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {getImageUrl(i.imagenUrl)
                    ? <img src={getImageUrl(i.imagenUrl)} alt={i.relojNombre} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                    : <Emblem size={30} fg="var(--border-dk)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{i.relojNombre}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', margin: '2px 0 4px' }}>{i.maquina} · {i.pulsera}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-2)' }}>{i.cantidad} × RD$ {i.precio.toLocaleString('es-DO')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>RD$ {(i.precio * i.cantidad).toLocaleString('es-DO')}</div>
                  <button onClick={() => onQuitar(i.key)} style={{ marginTop: 8, fontSize: 8.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: 0 }}>Quitar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con total */}
        {items.length > 0 && (
          <div style={{ padding: '18px 30px 26px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total ({unidades} pza)</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>RD$ {total.toLocaleString('es-DO')}</span>
            </div>
            <button onClick={onCheckout} style={{ width: '100%', padding: '14px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer', transition: 'background 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
              Proceder al pago
            </button>
            <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: '11px', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Seguir comprando</button>
            <button onClick={onVaciar} style={{ width: '100%', marginTop: 10, padding: '10px', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Vaciar carrito</button>
          </div>
        )}
      </div>
    </div>
  );
}
