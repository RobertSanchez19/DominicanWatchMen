// Banner de llamada a la accion al final del landing.
export default function CTABanner() {
  const irA = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  return (
    <section style={{ padding: '120px 56px', background: 'var(--off-white)', textAlign: 'center', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.10)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.05)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }}></span>
          <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'var(--gold)' }}>Comencemos</span>
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold)' }}></span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,4.5vw,64px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 20 }}>
          ¿Listo para tu<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold)' }}>pieza única</em>?
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          Cada reloj Dominican Watch Men es una decisión. Cuéntanos tu visión y la hacemos realidad.
        </p>
        <button onClick={() => irA('colecciones')} style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase',
          background: 'var(--ink)', color: 'var(--white)', padding: '18px 48px', borderRadius: 0,
          transition: 'all 0.3s', border: 'none', cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
          Explorar la Colección
        </button>
      </div>
    </section>
  );
}
