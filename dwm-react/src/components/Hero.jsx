// Portada principal del landing (texto a la izquierda, reloj a la derecha).
export default function Hero() {
  const irA = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <section className="col2" style={{
      minHeight: '100vh', background: 'var(--white)', display: 'grid',
      gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 0 0 56px', overflow: 'hidden',
    }}>
      {/* Left text */}
      <div style={{ paddingTop: 72, maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }}></span>
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)' }}>Alta Relojería · Seiko Mods</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(54px,5.5vw,84px)', fontWeight: 600,
          lineHeight: 1.05, letterSpacing: '-0.01em', color: 'var(--ink)', marginBottom: 28,
        }}>
          No vendemos<br />
          <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold)' }}>relojes.</em><br />
          Ensamblamos<br />tiempo.
        </h1>
        <p style={{ fontSize: 14, fontWeight: 400, lineHeight: 1.8, color: 'var(--ink-3)', maxWidth: 420, marginBottom: 40 }}>
          Movimientos Seiko originales. Componentes de grado quirúrgico.
          Diseños inspirados en los íconos de la alta relojería. Piezas únicas con alma clásica.
        </p>
        <div style={{ display: 'flex', gap: 12, marginBottom: 56 }}>
          <button onClick={() => irA('colecciones')} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--white)', padding: '15px 32px', borderRadius: 3,
            transition: 'all 0.3s', cursor: 'pointer', border: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
            Explorar Colección
          </button>
          <button onClick={() => irA('especificaciones')} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'transparent', color: 'var(--ink)',
            border: '1px solid var(--border-dk)', padding: '15px 32px', borderRadius: 3,
            transition: 'all 0.3s', cursor: 'pointer',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dk)'; e.currentTarget.style.color = 'var(--ink)'; }}>
            Ver Especificaciones
          </button>
        </div>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, borderTop: '1px solid var(--border)', paddingTop: 28 }}>
          {[['20+', 'Modelos únicos'], ['100%', 'Seiko original'], ['316L', 'Acero quirúrgico']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginTop: 5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — hero watch */}
      <div style={{
        height: '100vh', background: 'var(--off-white)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 70% at 50% 45%, rgba(255,255,255,1) 0%, var(--off-white) 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.06)', pointerEvents: 'none' }} />
        <img src="/assets/products/transparent/submariner-steel-bk-bk.png" alt="Submariner Steel"
          style={{
            position: 'relative', zIndex: 1, width: '75%', maxWidth: 440, height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.18)) drop-shadow(0 8px 24px rgba(0,0,0,0.12))',
          }} />
        <div style={{
          position: 'absolute', bottom: 40, left: 40,
          fontSize: 8, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-4)',
        }}>
          THE DIVER SERIES · NH35A
        </div>
      </div>
    </section>
  );
}
