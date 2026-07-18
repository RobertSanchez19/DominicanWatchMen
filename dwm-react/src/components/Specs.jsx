const SPECS = [
  { label: 'Calibre',      value: 'NH34 · NH35 · NH38', desc: 'Movimientos automáticos Seiko originales. Sin batería, sin compromiso.' },
  { label: 'Caja',         value: 'Acero 316L',          desc: 'Grado quirúrgico. Resistente a corrosión y reacciones alérgicas.' },
  { label: 'Cristal',      value: 'Zafiro AR',           desc: 'Dureza Mohs 9. Antirreflejo ambas caras para máxima legibilidad.' },
  { label: 'Hermeticidad', value: '50m – 300m',          desc: 'Juntas de silicona. Test individual por modelo antes de entregar.' },
  { label: 'Reserva',      value: '41 – 70 horas',       desc: 'Autonomía sin cuerda según calibre instalado.' },
  { label: 'Frecuencia',   value: '21,600 bph',          desc: '6 ticks por segundo. Precisión mecánica certificada.' },
];

// Especificaciones tecnicas (elementos estaticos).
export default function Specs() {
  return (
    <section id="especificaciones" style={{ padding: '96px 56px', background: 'var(--white)', borderTop: '1px solid var(--border)', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="col2" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 96, alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'block' }}></span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)' }}>Ingeniería</span>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(36px,3.5vw,52px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 20 }}>
              Especificaciones<br /><em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold)' }}>Técnicas</em>
            </h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.8, color: 'var(--ink-3)', marginBottom: 36 }}>
              Cada componente es seleccionado por su rendimiento y durabilidad.
              No hacemos concesiones — solo los mejores materiales para cada pieza.
            </p>
            <div style={{ background: 'var(--off-white)', borderRadius: 12, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <img src="/assets/products/transparent/PRXeiko-SV-BL.png" alt="PRXeiko"
                style={{ width: 220, height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.12))' }} />
            </div>
          </div>
          <div>
            {SPECS.map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '160px 1fr', gap: 24, padding: '28px 0',
                borderBottom: i < SPECS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{s.value}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.7, paddingTop: 22 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
