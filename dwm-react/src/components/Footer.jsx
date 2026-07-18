import Emblem from './Emblem.jsx';

// Pie de pagina con columnas de enlaces y datos de la marca.
export default function Footer() {
  const cols = [
    ['Colecciones', ['Diver Series', 'Nautiko', 'PRXeiko', 'GMTeiko', 'Executive', 'Chrono']],
    ['Empresa', ['El Proceso', 'Personalizar', 'Garantía', 'FAQ']],
    ['Contacto', ['Instagram', 'WhatsApp', 'Email', 'Showroom']],
  ];
  return (
    <footer style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '72px 56px 36px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 56 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <Emblem size={46} fg="var(--gold)" flag={true} />
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)', letterSpacing: '0.02em', lineHeight: 1.05 }}>Dominican<br />Watch Men</div>
            </div>
            <div style={{ width: 24, height: 1, background: 'var(--gold)', marginBottom: 8 }}></div>
            <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Alta Relojería · Santo Domingo, RD</div>
          </div>
          <div style={{ display: 'flex', gap: 64 }}>
            {cols.map(([title, items]) => (
              <div key={title}>
                <div style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>{title}</div>
                {items.map(item => (
                  item === 'WhatsApp'
                    ? <a key={item} href="https://wa.me/18094079575" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'none' }}
                        onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>{item}</a>
                    : <div key={item} style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-2)', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                        onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>{item}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>© 2026 Dominican Watch Men · Todos los derechos reservados</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Cristal Zafiro <span style={{ color: 'var(--gold)', margin: '0 6px' }}>·</span> Acero 316L <span style={{ color: 'var(--gold)', margin: '0 6px' }}>·</span> Movimiento Seiko
          </div>
        </div>
      </div>
    </footer>
  );
}
