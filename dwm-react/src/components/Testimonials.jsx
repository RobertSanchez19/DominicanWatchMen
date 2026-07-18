const TESTIS = [
  { text: '"Recibí el GMT Pepsi y es simplemente perfecto. El acabado es de boutique suiza, pero con el corazón japonés que amo."', name: 'Carlos M.', loc: 'Santo Domingo, RD' },
  { text: '"El Nautiko Royal Blue superó todas mis expectativas. Nadie cree que no es una pieza de colección auténtica."', name: 'Andrés V.', loc: 'Bogotá' },
  { text: '"Proceso impecable desde la consulta hasta la entrega. Mi Submariner 007 es una obra de arte en mi muñeca."', name: 'Daniela R.', loc: 'Buenos Aires' },
];

// Testimonios de clientes (elementos estaticos).
export default function Testimonials() {
  return (
    <section style={{ padding: '96px 56px', background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Coleccionistas DWM</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 600, color: 'var(--ink)' }}>Lo que dicen quienes ya eligieron</h2>
        </div>
        <div className="col3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {TESTIS.map((t, i) => (
            <div key={i} style={{ background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 12, padding: '36px 28px' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 48, color: 'var(--gold)', lineHeight: 0.7, marginBottom: 18, opacity: 0.4 }}>"</div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 15.5, fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.75, marginBottom: 24 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--warm-grey)', border: '1px solid var(--border-dk)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--gold)', fontWeight: 600 }}>{t.name[0]}</span>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
