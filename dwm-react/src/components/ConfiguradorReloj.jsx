import React from 'react';
import { getImageUrl } from '../utils/getImageUrl.js';
import WatchPlaceholder from './WatchPlaceholder.jsx';
import Panel from './Panel.jsx';
import Contador from './Contador.jsx';
import ResenasReloj from './ResenasReloj.jsx';

// Modal de detalle / configurador de un reloj (modelo BOM):
// se elige maquina + pulsera (independientes) y se calcula precio y stock.
export default function ConfiguradorReloj({ reloj, onClose, onAgregar, usuario }) {
  const maquinas = reloj.movimientosCompatibles || [];
  const pulseras = reloj.pulserasCompatibles || [];
  const [movId, setMovId]       = React.useState(maquinas[0] ? maquinas[0].id : null);
  const [pulId, setPulId]       = React.useState(pulseras[0] ? pulseras[0].id : null);
  const [cantidad, setCantidad] = React.useState(1);
  const [agregado, setAgregado] = React.useState(false);

  const maquina = maquinas.find(m => m.id === movId) || null;
  const pulsera = pulseras.find(p => p.id === pulId) || null;

  // Precio = base del reloj + extra de la maquina + extra de la pulsera
  const precio = (reloj.precio || 0) + (maquina ? maquina.precioExtra : 0) + (pulsera ? pulsera.precioExtra : 0);
  // Disponibilidad = minimo entre base, maquina y pulsera (se ensambla con 1 de cada uno)
  const disponible = Math.min(reloj.stock || 0, maquina ? maquina.stock : 0, pulsera ? pulsera.stock : 0);
  const faltante = (reloj.stock || 0) <= 0 ? 'la base' : (maquina && maquina.stock <= 0 ? maquina.nombre : (pulsera && pulsera.stock <= 0 ? pulsera.nombre : null));

  const chip = (activo, agotado) => ({
    fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '9px 16px', borderRadius: 9999, cursor: agotado ? 'not-allowed' : 'pointer',
    background: activo ? 'var(--ink)' : 'transparent',
    color: agotado ? 'var(--ink-4)' : (activo ? 'var(--white)' : 'var(--ink-3)'),
    border: activo ? '1px solid var(--ink)' : '1px solid var(--border-dk)',
    opacity: agotado ? 0.5 : 1, transition: 'all 0.2s',
  });

  const agregar = () => {
    if (!maquina || !pulsera || disponible <= 0) return;
    onAgregar && onAgregar({
      relojId: reloj.id, relojNombre: reloj.nombre, imagenUrl: reloj.imagenUrl,
      movimientoId: maquina.id, maquina: maquina.nombre,
      tipoPulseraId: pulsera.id, pulsera: pulsera.nombre,
      precio, cantidad, max: disponible,
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1800);
  };

  const sinOpciones = maquinas.length === 0 || pulseras.length === 0;

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, width: '100%', maxWidth: 840, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

          {/* Imagen del reloj */}
          <div style={{ background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', minHeight: 360 }}>
            <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(184,146,42,0.12)' }} />
            {getImageUrl(reloj.imagenUrl)
              ? <img src={getImageUrl(reloj.imagenUrl)} alt={reloj.nombre} style={{ position: 'relative', zIndex: 1, width: '80%', maxWidth: 260, objectFit: 'contain', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))' }} />
              : <WatchPlaceholder size={200} />}
          </div>

          {/* Configuracion */}
          <div style={{ padding: '30px 34px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)' }}>{reloj.marca?.nombre || 'Dominican Watch Men'}</div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{reloj.nombre}</h2>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-4)', marginBottom: 22 }}>{reloj.modelo}</div>

            {sinOpciones ? (
              <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Este reloj aun no tiene maquinas o pulseras configuradas.</p>
            ) : (
              <>
                {/* Selector de maquina (independiente) */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Maquina</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {maquinas.map(m => {
                      const ag = m.stock <= 0;
                      return <button key={m.id} disabled={ag} onClick={() => !ag && setMovId(m.id)} style={chip(movId === m.id, ag)}>
                        {m.nombre}{m.precioExtra > 0 ? ` +${m.precioExtra.toLocaleString('es-DO')}` : ''}{ag ? ' · agotada' : ''}
                      </button>;
                    })}
                  </div>
                </div>

                {/* Selector de pulsera (independiente) */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Pulsera</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {pulseras.map(p => {
                      const ag = p.stock <= 0;
                      return <button key={p.id} disabled={ag} onClick={() => !ag && setPulId(p.id)} style={chip(pulId === p.id, ag)}>
                        {p.nombre}{p.precioExtra > 0 ? ` +${p.precioExtra.toLocaleString('es-DO')}` : ''}{ag ? ' · agotada' : ''}
                      </button>;
                    })}
                  </div>
                </div>

                {/* Resumen y accion (Panel recibe children) */}
                <Panel>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>RD$ {precio.toLocaleString('es-DO')}</div>
                    {disponible > 0
                      ? <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>{disponible} disponibles</span>
                      : <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--rose)' }}>Agotado{faltante ? ` (${faltante})` : ''}</span>}
                  </div>

                  {disponible > 0 && (
                    <>
                      <Contador precio={precio} max={disponible} onCantidad={setCantidad} />
                      <button onClick={agregar} style={{
                        marginTop: 14, width: '100%', padding: '14px', fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.16em', textTransform: 'uppercase', borderRadius: 3, border: 'none', cursor: 'pointer',
                        background: agregado ? 'var(--forest, #2D6A4F)' : 'var(--ink)', color: 'var(--white)', transition: 'background 0.25s',
                      }}
                        onMouseEnter={e => { if (!agregado) e.currentTarget.style.background = 'var(--gold)'; }}
                        onMouseLeave={e => { if (!agregado) e.currentTarget.style.background = 'var(--ink)'; }}>
                        {agregado ? 'Agregado a tu seleccion' : 'Añadir al carrito'}
                      </button>
                    </>
                  )}
                </Panel>
              </>
            )}
          </div>
        </div>
        <ResenasReloj reloj={reloj} usuario={usuario} />
      </div>
    </div>
  );
}
