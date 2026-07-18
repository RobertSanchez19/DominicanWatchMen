import React from 'react';

// Campo de contraseña con boton "Ver/Ocultar" (cambia la visibilidad del texto).
// Reutilizable: se usa en login, registro y restablecer contraseña.
export default function PasswordInput({ value, onChange, placeholder = '••••••••', style, required }) {
  const [ver, setVer] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input type={ver ? 'text' : 'password'} value={value} onChange={onChange} required={required} placeholder={placeholder}
        style={{ ...style, paddingRight: 62 }} />
      <button type="button" tabIndex={-1} onClick={() => setVer(v => !v)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', padding: 4 }}>
        {ver ? 'Ocultar' : 'Ver'}
      </button>
    </div>
  );
}
