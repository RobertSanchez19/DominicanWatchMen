import React from 'react';
import { getRelojes, getFavoritos, addFavorito, removeFavorito } from '../services/api.js';
import { getImageUrl } from '../utils/getImageUrl.js';
import WatchPlaceholder from './WatchPlaceholder.jsx';
import Estrellas from './Estrellas.jsx';
import ConfiguradorReloj from './ConfiguradorReloj.jsx';

// Catalogo de relojes. Trae los datos del API (via el servicio), permite
// buscar, filtrar y ordenar, y muestra una tarjeta por cada reloj.
export default function CollectionGrid({ refreshKey = 0, onAgregar, productoId, onAbrir, onCerrarDetalle, usuario }) {
  const [active, setActive]   = React.useState('Todos');
  const [hov, setHov]         = React.useState(null);
  const [relojes, setRelojes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);
  const [busqueda, setBusqueda]   = React.useState('');
  const [orden, setOrden]         = React.useState('relevancia');
  const [precioMax, setPrecioMax] = React.useState('');
  const [favIds, setFavIds]       = React.useState(new Set());
  // El reloj a configurar viene de la ruta /producto/:id
  const detalle = productoId ? relojes.find(r => r.id === productoId) : null;

  React.useEffect(() => {
    if (usuario) getFavoritos(usuario.id).then(list => setFavIds(new Set(list.map(x => x.id)))).catch(() => {});
    else setFavIds(new Set());
  }, [usuario, refreshKey]);

  const toggleFav = async (relojId) => {
    const has = favIds.has(relojId);
    const next = new Set(favIds); has ? next.delete(relojId) : next.add(relojId); setFavIds(next);
    if (has) await removeFavorito(usuario.id, relojId);
    else await addFavorito(usuario.id, relojId);
  };

  React.useEffect(() => {
    setLoading(true);
    getRelojes()
      .then(data => { setRelojes(data); setLoading(false); })
      .catch(() => { setError('No se pudo conectar con la API. Verifica que el servidor esté corriendo.'); setLoading(false); });
  }, [refreshKey]);

  // Precio "desde" = base + los extras mas baratos (para filtrar y ordenar)
  const precioDesde = (r) => {
    const maq = r.movimientosCompatibles || [], pul = r.pulserasCompatibles || [];
    return (r.precio || 0) + (maq.length ? Math.min(...maq.map(m => m.precioExtra)) : 0) + (pul.length ? Math.min(...pul.map(p => p.precioExtra)) : 0);
  };
  const marcas = ['Todos', ...[...new Set(relojes.map(r => r.marca?.nombre || 'Sin Marca'))]];
  let filtered = relojes.filter(r => {
    const q = busqueda.trim().toLowerCase();
    const coincide = !q || `${r.nombre} ${r.modelo || ''} ${r.marca?.nombre || ''}`.toLowerCase().includes(q);
    const marcaOk = active === 'Todos' || (r.marca?.nombre || 'Sin Marca') === active;
    const precioOk = !precioMax || precioDesde(r) <= parseFloat(precioMax);
    return coincide && marcaOk && precioOk;
  });
  if (orden === 'precio-asc') filtered = [...filtered].sort((a, b) => precioDesde(a) - precioDesde(b));
  else if (orden === 'precio-desc') filtered = [...filtered].sort((a, b) => precioDesde(b) - precioDesde(a));
  else if (orden === 'nombre') filtered = [...filtered].sort((a, b) => a.nombre.localeCompare(b.nombre));
  else if (orden === 'nuevos') filtered = [...filtered].sort((a, b) => b.id - a.id);

  return (
    <section id="colecciones" style={{ padding: '96px 56px', background: 'var(--white)', scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 24, height: 1, background: 'var(--gold)', display: 'block' }}></span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)' }}>Nuestros Modelos</span>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,4vw,58px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.05 }}>La Colección</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {loading && (
              <span style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Cargando desde API...
              </span>
            )}
            {!loading && !error && (
              <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                {filtered.length} modelos disponibles ✦
              </span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8,
            padding: '16px 20px', marginBottom: 32, color: '#dc2626', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Buscador, orden y precio */}
        {!loading && !error && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, marca o modelo..." style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, fontFamily: 'var(--sans)', outline: 'none', background: 'var(--white)' }} />
            <select value={orden} onChange={e => setOrden(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--white)', color: 'var(--ink)' }}>
              <option value="relevancia">Ordenar: relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre (A-Z)</option>
              <option value="nuevos">Mas nuevos</option>
            </select>
            <input type="number" min="0" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="Precio max RD$" style={{ width: 150, padding: '10px 12px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--sans)', outline: 'none', background: 'var(--white)' }} />
          </div>
        )}

        {/* Filtros por marca */}
        {!loading && !error && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 44 }}>
            {marcas.map(s => {
              const on = active === s;
              return (
                <button key={s} onClick={() => setActive(s)} style={{
                  fontSize: 9.5, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '8px 18px', borderRadius: 9999,
                  background: on ? 'var(--ink)' : 'transparent',
                  color: on ? 'var(--white)' : 'var(--ink-3)',
                  border: on ? '1px solid var(--ink)' : '1px solid var(--border-dk)',
                  transition: 'all 0.2s', cursor: 'pointer',
                }}>{s}</button>
              );
            })}
          </div>
        )}

        {/* Skeleton de carga */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--white)', overflow: 'hidden',
              }}>
                <div style={{ height: 210, background: 'var(--warm-grey)', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ padding: '15px 17px 17px' }}>
                  <div style={{ height: 10, background: 'var(--warm-grey)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
                  <div style={{ height: 18, background: 'var(--warm-grey)', borderRadius: 4, marginBottom: 6 }} />
                  <div style={{ height: 10, background: 'var(--warm-grey)', borderRadius: 4, marginBottom: 18, width: '80%' }} />
                  <div style={{ height: 32, background: 'var(--warm-grey)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-4)', fontSize: 13 }}>No se encontraron relojes con esos filtros.</div>
        )}

        {/* Grid de relojes */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {filtered.map((w, i) => {
              // Modelo BOM: precio "desde" = base + extras mas baratos; disponible = min(base, mejor maquina, mejor pulsera)
              const maq = w.movimientosCompatibles || [];
              const pul = w.pulserasCompatibles || [];
              const desde = precioDesde(w);
              const stockTotal = (maq.length && pul.length) ? Math.min(w.stock || 0, Math.max(...maq.map(m => m.stock)), Math.max(...pul.map(p => p.stock))) : (w.stock || 0);
              const rese = w.resenas || [];
              const rprom = rese.length ? rese.reduce((s, r) => s + r.calificacion, 0) / rese.length : 0;
              return (
              <div key={w.id}
                onClick={() => onAbrir && onAbrir(w.id)}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                style={{
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  border: `1px solid ${hov === i ? 'var(--border-dk)' : 'var(--border)'}`,
                  background: 'var(--white)',
                  transition: 'all 0.35s var(--ease)',
                  transform: hov === i ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: hov === i
                    ? '0 20px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                }}>

                {/* Imagen / placeholder */}
                <div style={{ background: 'var(--white)', height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 55%, var(--off-white) 0%, var(--white) 70%)', pointerEvents: 'none' }} />
                  {getImageUrl(w.imagenUrl) ? (
                    <img src={getImageUrl(w.imagenUrl)} alt={w.nombre}
                      style={{
                        height: 185, width: 'auto', objectFit: 'contain', position: 'relative', zIndex: 1,
                        transition: 'transform 0.5s var(--ease)',
                        transform: hov === i ? 'scale(1.07)' : 'scale(1)',
                        filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.16)) drop-shadow(0 4px 8px rgba(0,0,0,0.08))',
                      }} />
                  ) : (
                    <div style={{ position: 'relative', zIndex: 1, transition: 'transform 0.5s var(--ease)', transform: hov === i ? 'scale(1.07)' : 'scale(1)' }}>
                      <WatchPlaceholder size={160} hovered={hov === i} />
                    </div>
                  )}
                  {stockTotal <= 3 && stockTotal > 0 && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10, zIndex: 2,
                      fontSize: 7.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                      background: 'var(--rose)', color: 'var(--white)', padding: '4px 9px', borderRadius: 2,
                    }}>Últimas {stockTotal}</span>
                  )}
                  {stockTotal === 0 && (
                    <span style={{
                      position: 'absolute', top: 10, left: 10, zIndex: 2,
                      fontSize: 7.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                      background: 'var(--ink-3)', color: 'var(--white)', padding: '4px 9px', borderRadius: 2,
                    }}>Agotado</span>
                  )}
                  {usuario && (
                    <button onClick={e => { e.stopPropagation(); toggleFav(w.id); }} title="Favorito" style={{ position: 'absolute', top: 8, right: 8, zIndex: 2, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.92)', cursor: 'pointer', fontSize: 15, lineHeight: 1, color: favIds.has(w.id) ? 'var(--rose)' : 'var(--ink-4)' }}>{favIds.has(w.id) ? '♥' : '♡'}</button>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '15px 17px 17px' }}>
                  <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 5 }}>
                    {w.marca?.nombre || 'Sin Marca'}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, lineHeight: 1.2 }}>
                    {w.nombre}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.05em', marginBottom: 6 }}>
                    {w.modelo}
                  </div>
                  {rese.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <Estrellas valor={rprom} tam={11} />
                      <span style={{ fontSize: 9.5, color: 'var(--ink-4)' }}>({rese.length})</span>
                    </div>
                  )}
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 14 }}>
                    Desde RD$ {desde.toLocaleString('es-DO')}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onAbrir && onAbrir(w.id); }} style={{
                    width: '100%', fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '9px', borderRadius: 3,
                    background: hov === i ? 'var(--ink)' : 'transparent',
                    color: hov === i ? 'var(--white)' : 'var(--ink-3)',
                    border: '1px solid var(--border-dk)', transition: 'all 0.25s',
                  }}>
                    Ver Detalle
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
      {detalle && <ConfiguradorReloj reloj={detalle} onClose={onCerrarDetalle} onAgregar={onAgregar} usuario={usuario} />}
    </section>
  );
}
