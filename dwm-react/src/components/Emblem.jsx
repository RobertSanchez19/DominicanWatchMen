// Logo de la marca dibujado como SVG (elemento estatico hecho en codigo).
export default function Emblem({ size = 64, fg = 'var(--gold)', flag = false }) {
  const c = 60, ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180, major = i % 3 === 0;
    const r1 = 50, r2 = major ? 40 : 45;
    ticks.push(
      <line key={i}
        x1={(c + Math.cos(a) * r1).toFixed(2)} y1={(c + Math.sin(a) * r1).toFixed(2)}
        x2={(c + Math.cos(a) * r2).toFixed(2)} y2={(c + Math.sin(a) * r2).toFixed(2)}
        stroke={fg} strokeWidth={major ? 2.2 : 1} strokeLinecap="round" />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
      style={{ display: 'block', flexShrink: 0 }} aria-label="Dominican Watch Men">
      <circle cx="60" cy="60" r="56" fill="none" stroke={fg} strokeWidth="2.2" />
      <circle cx="60" cy="60" r="50.5" fill="none" stroke={fg} strokeWidth="0.6" opacity="0.5" />
      {flag && (
        <g>
          <path d="M60,60 L60,18 A42,42,0,0,0,18,60 Z" fill="#0A3A8C" />
          <path d="M60,60 L102,60 A42,42,0,0,0,60,18 Z" fill="#CE1126" />
          <path d="M60,60 L18,60 A42,42,0,0,0,60,102 Z" fill="#CE1126" />
          <path d="M60,60 L60,102 A42,42,0,0,0,102,60 Z" fill="#0A3A8C" />
        </g>
      )}
      {ticks}
      <g stroke={fg} strokeWidth="1" opacity="0.9">
        <line x1="60" y1="20" x2="60" y2="100" />
        <line x1="20" y1="60" x2="100" y2="60" />
      </g>
      <circle cx="60" cy="60" r="4.4" fill={fg} />
      <circle cx="60" cy="60" r="8" fill="none" stroke={fg} strokeWidth="1" />
      <text x="60" y="80" textAnchor="middle" fontFamily="var(--mono)" fontSize="8.5"
        fontWeight="500" letterSpacing="1.5" fill={fg}>RD</text>
    </svg>
  );
}
