// Recuadro reutilizable con estilo (borde + sombra). Recibe props (eyebrow,
// titulo) y `children` = el contenido que el padre coloca dentro.
export default function Panel({ eyebrow, titulo, children }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '30px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
      {eyebrow && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ width: 18, height: 1, background: 'var(--gold)', display: 'block' }} />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)' }}>{eyebrow}</span>
        </div>
      )}
      {titulo && <h3 style={{ fontFamily: 'var(--serif)', fontSize: 23, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>{titulo}</h3>}
      {/* children = lo que el padre pasó dentro de este componente */}
      {children}
    </div>
  );
}
