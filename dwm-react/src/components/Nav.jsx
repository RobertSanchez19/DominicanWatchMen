import Emblem from './Emblem.jsx';

// Barra de navegacion superior (header). Recibe la prop `scrolled` para
// volverse compacta al bajar, y `onNavigate` para cambiar de pagina.
export default function Nav({ scrolled, usuario, onOpenCuenta, onOpenAdmin, onNavigate, carritoCount = 0, onOpenCarrito }) {
  const links = [
    { label: 'Colecciones',      target: 'colecciones' },
    { label: 'Especificaciones', target: 'especificaciones' },
    { label: 'El Proceso',       target: 'proceso' },
  ];
  const irA = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 56px',
      background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0)',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      transition: 'all 0.45s var(--ease)',
    }}>
      <div onClick={() => onNavigate && onNavigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <Emblem size={38} fg="var(--gold)" />
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 21, fontWeight: 600, color: 'var(--ink)', letterSpacing: '0.03em' }}>Dominican</div>
          <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 3 }}>Watch Men · RD</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        {links.map(l => (
          <a key={l.label} href="#" style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', transition: 'color 0.2s' }}
            onClick={e => { e.preventDefault(); irA(l.target); }}
            onMouseEnter={e => e.target.style.color = 'var(--ink)'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>{l.label}</a>
        ))}
        <a href="#" style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', transition: 'color 0.2s' }}
          onClick={e => { e.preventDefault(); onNavigate && onNavigate('/garantia'); }}
          onMouseEnter={e => e.target.style.color = 'var(--ink)'}
          onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>Garantia</a>
        {usuario?.esAdmin && (
          <button onClick={onOpenAdmin} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--white)', border: 'none',
            padding: '8px 16px', borderRadius: 3, transition: 'background 0.25s', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
            Admin
          </button>
        )}
        {(usuario?.rol === 'Fabricante' || usuario?.rol === 'Admin') && (
          <button onClick={() => onNavigate && onNavigate('/fabricacion')} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--white)', border: 'none',
            padding: '8px 16px', borderRadius: 3, transition: 'background 0.25s', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
            Taller
          </button>
        )}
        {(usuario?.rol === 'Soporte' || usuario?.rol === 'Admin') && (
          <button onClick={() => onNavigate && onNavigate('/soporte')} style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--white)', border: 'none',
            padding: '8px 16px', borderRadius: 3, transition: 'background 0.25s', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
            Soporte
          </button>
        )}
        <button onClick={onOpenCuenta} style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          background: usuario ? 'var(--gold-pale)' : 'transparent',
          color: usuario ? 'var(--gold)' : 'var(--ink-3)',
          border: `1px solid ${usuario ? 'var(--gold-lt)' : 'var(--border-dk)'}`,
          padding: '9px 18px', borderRadius: 3, transition: 'all 0.25s', cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = usuario ? 'var(--gold-lt)' : 'var(--border-dk)'; e.currentTarget.style.color = usuario ? 'var(--gold)' : 'var(--ink-3)'; }}
        >
          {usuario ? `${usuario.nombre}` : 'Mi Cuenta'}
        </button>
        <button onClick={onOpenCarrito} style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          background: 'var(--ink)', color: 'var(--white)', border: 'none',
          padding: '9px 16px', borderRadius: 3, cursor: 'pointer', transition: 'background 0.25s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
          Carrito{carritoCount > 0 ? ` · ${carritoCount}` : ''}
        </button>
      </div>
    </nav>
  );
}
