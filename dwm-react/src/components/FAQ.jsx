import React from 'react';

const FAQS = [
  { q: '¿Son movimientos Seiko originales?', a: 'Sí. Utilizamos exclusivamente calibres Seiko originales: NH35A, NH34, NH38 y VK63. Nunca movimientos genéricos o réplicas.' },
  { q: '¿Cuánto tiempo demora el ensamblaje?', a: 'Entre 7 y 14 días hábiles dependiendo del modelo y la configuración. Para piezas personalizadas, puede extenderse hasta 21 días.' },
  { q: '¿Tienen garantía?', a: 'Sí. 12 meses de garantía sobre el movimiento y el ensamblaje. El cristal de zafiro tiene garantía de por vida contra defectos de fabricación.' },
  { q: '¿Puedo personalizar mi reloj?', a: 'Absolutamente. Ofrecemos personalización de dial, bezel, brazalete y tratamientos PVD. Contáctanos para una consulta sin costo.' },
  { q: '¿Hacen envíos internacionales?', a: 'Sí, enviamos a toda Latinoamérica y España con seguro incluido. El tiempo de envío varía entre 5 y 15 días hábiles.' },
];

// Preguntas frecuentes (acordeon): muestra/oculta la respuesta con estado `open`.
export default function FAQ() {
  const [open, setOpen] = React.useState(null);
  return (
    <section style={{ padding: '96px 56px', background: 'var(--off-white)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Preguntas Frecuentes</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px,3.5vw,48px)', fontWeight: 600, color: 'var(--ink)' }}>FAQ Técnica</h2>
        </div>
        {FAQS.map((f, i) => (
          <div key={i} style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{f.q}</span>
              <span style={{ color: 'var(--gold)', fontSize: 22, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0, marginLeft: 16, fontWeight: 300 }}>+</span>
            </button>
            {open === i && <div style={{ padding: '0 0 22px', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.8 }}>{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
