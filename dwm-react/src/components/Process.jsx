import React from 'react';

const STEPS = [
  { n: '01', title: 'Selección del Calibre', desc: 'Elegimos el movimiento Seiko ideal — NH35, NH38 o NH34 — según complicación y carácter de cada pieza.' },
  { n: '02', title: 'Componentes Quirúrgicos', desc: 'Cajas 316L, cristales de zafiro AR, bezels, coronas y sellos con tolerancias de precisión milimétrica.' },
  { n: '03', title: 'Ensamblaje Artesanal', desc: 'Cada pieza es montada a mano, paso a paso. Cada tornillo y junta, en su posición exacta.' },
  { n: '04', title: 'Control de Calidad', desc: 'Test de hermeticidad, regulación del movimiento y revisión visual. Solo sale lo que pasa el estándar DWM.' },
];

// Pasos del proceso de fabricacion (con estado de hover).
export default function Process() {
  const [hov, setHov] = React.useState(null);
  return (
    <section id="proceso" style={{ padding: '96px 56px', background: 'var(--off-white)', borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>El Arte del Modding</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px,4vw,56px)', fontWeight: 600, color: 'var(--ink)' }}>El Proceso DWM</h2>
        </div>
        <div className="col2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {STEPS.map((s, i) => (
            <div key={i}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{
                background: 'var(--white)', borderRadius: 10, padding: '36px 28px',
                border: '1px solid var(--border)',
                transition: 'all 0.3s var(--ease)',
                boxShadow: hov === i ? '0 12px 36px rgba(0,0,0,0.08)' : 'none',
                transform: hov === i ? 'translateY(-4px)' : 'none',
                cursor: 'default',
              }}>
              <div style={{
                fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 600,
                color: hov === i ? 'rgba(184,146,42,0.25)' : 'rgba(0,0,0,0.06)',
                lineHeight: 1, marginBottom: 20, transition: 'color 0.3s',
              }}>{s.n}</div>
              <div style={{ width: 28, height: 1, background: 'var(--gold)', marginBottom: 18 }}></div>
              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>{s.title}</h4>
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.75 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
