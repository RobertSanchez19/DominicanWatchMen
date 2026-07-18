// Cinta deslizante (marquee) con las caracteristicas del producto.
export default function Strip() {
  const items = ['Cristal de Zafiro', 'Acero 316L', 'Movimiento NH35', '300m Water Resistant', 'Ensamblado a Mano', 'Seiko Original', 'Alta Relojería'];
  const repeated = [...items, ...items, ...items];
  return (
    <div style={{ background: 'var(--off-white)', padding: '16px 0', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', animation: 'marquee 28s linear infinite' }}>
        {repeated.map((t, i) => (
          <span key={i} style={{
            fontSize: 9, fontWeight: 500, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'var(--ink-2)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 48,
          }}>
            {t}
            <span style={{ color: 'var(--gold)', fontSize: 8 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
