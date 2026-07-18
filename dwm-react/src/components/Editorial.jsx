import React from 'react';

const T = '/assets/products/transparent/';

// Pieza destacada con selector (estado `sel`) que cambia el reloj mostrado.
export default function Editorial() {
  const [sel, setSel] = React.useState(0);
  const irA = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const watches = [
    { img: T + 'Nautiko_Rose_Gold_Chocolate_Open_Heart.png', series: 'Nautiko', name: 'Rose Gold Open Heart', ref: 'DWM-NAU-RG-OH', specs: ['NH38', 'Oro Rosa PVD', 'Corazón Abierto', '316L'] },
    { img: T + 'GMTeiko-Pepsi.png', series: 'GMTeiko', name: 'Pepsi Edition', ref: 'DWM-GMT-PEP', specs: ['NH34', 'GMT Dual Time', 'Jubilee 316L', 'Cerámica Bi-color'] },
    { img: T + 'Santeiko-SV-WH.png', series: 'Santeiko', name: 'Silver White', ref: 'DWM-SAN-SV-WH', specs: ['VK63 Meca-Quartz', 'Tornillos Expuestos', 'Agujas Azul Zafiro', '316L'] },
  ];
  const w = watches[sel];
  return (
    <section style={{ background: 'var(--off-white)', padding: '96px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--white)', borderRadius: 16, padding: '60px 48px',
          boxShadow: '0 4px 32px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
          minHeight: 480, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.1)', pointerEvents: 'none' }} />
          <img src={w.img} alt={w.name}
            style={{
              width: '80%', maxWidth: 320, height: 'auto', objectFit: 'contain',
              filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))',
              transition: 'all 0.5s var(--ease)',
            }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ width: 20, height: 1, background: 'var(--gold)', display: 'block' }}></span>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)' }}>Pieza Destacada</span>
          </div>
          <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 10 }}>{w.series}</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(40px,4vw,60px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 8 }}>{w.name}</h2>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', marginBottom: 28 }}>{w.ref}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
            {w.specs.map((s, i) => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Característica 0{i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{s}</div>
              </div>
            ))}
          </div>
          <button onClick={() => irA('colecciones')} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'var(--ink)', color: 'var(--white)', padding: '15px 36px', borderRadius: 3,
            transition: 'background 0.25s', marginBottom: 28, border: 'none', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--ink)'}>
            Solicitar Este Modelo
          </button>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {watches.map((_, i) => (
              <button key={i} onClick={() => setSel(i)} style={{
                width: sel === i ? 28 : 8, height: 8, borderRadius: 9999,
                background: sel === i ? 'var(--ink)' : 'var(--border-dk)',
                border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
              }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
