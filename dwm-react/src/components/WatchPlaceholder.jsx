import Emblem from './Emblem.jsx';

// Marcador de posicion (circulo con el logo) cuando un reloj no tiene imagen.
export default function WatchPlaceholder({ size = 185, hovered = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: hovered ? 'var(--gold-pale)' : 'var(--warm-grey)',
      border: `2px solid ${hovered ? 'var(--gold-lt)' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.4s var(--ease)',
    }}>
      <Emblem size={size * 0.55} fg={hovered ? 'var(--gold)' : 'var(--border-dk)'} />
    </div>
  );
}
