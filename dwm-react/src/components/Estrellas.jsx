// Estrellas de calificacion. Solo lectura, o clicables si se pasa `onClick`.
export default function Estrellas({ valor = 0, tam = 13, onClick }) {
  return <span style={{ display: 'inline-flex', gap: 1 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} onClick={onClick ? () => onClick(n) : undefined}
        style={{ fontSize: tam, lineHeight: 1, color: n <= Math.round(valor) ? 'var(--gold)' : 'var(--border-dk)', cursor: onClick ? 'pointer' : 'default' }}>★</span>
    ))}
  </span>;
}
