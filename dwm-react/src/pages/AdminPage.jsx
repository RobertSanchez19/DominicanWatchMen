import React from 'react';
import { API } from '../config/api.js';
import { getImageUrl } from '../utils/getImageUrl.js';
import Emblem from '../components/Emblem.jsx';
import RelojModal from '../components/admin/RelojModal.jsx';
import CompatibilidadModal from '../components/admin/CompatibilidadModal.jsx';
import ComponentesModal from '../components/admin/ComponentesModal.jsx';
import PedidosModal from '../components/admin/PedidosModal.jsx';
import UsuariosModal from '../components/admin/UsuariosModal.jsx';
import DashboardAdmin from '../components/admin/DashboardAdmin.jsx';

// Panel de administracion: dashboard, tabla de relojes (CRUD) y modales
// de compatibilidad, componentes, pedidos y usuarios.
export default function AdminPage({ usuario, onVolver, onCambio }) {
  const [relojes, setRelojes]         = React.useState([]);
  const [marcas, setMarcas]           = React.useState([]);
  const [loading, setLoading]         = React.useState(true);
  const [modal, setModal]             = React.useState(null);
  const [confirmDelete, setConfirm]   = React.useState(null);
  const [variantesReloj, setVariantesReloj] = React.useState(null);
  const [componentesOpen, setComponentesOpen] = React.useState(false);
  const [pedidosOpen, setPedidosOpen] = React.useState(false);
  const [usuariosOpen, setUsuariosOpen] = React.useState(false);
  const [msg, setMsg]                 = React.useState(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/reloj`).then(r => r.json()),
      fetch(`${API}/api/marca`).then(r => r.json()),
    ]).then(([r, m]) => { setRelojes(r); setMarcas(m); setLoading(false); })
      .catch(() => setLoading(false));
  };

  React.useEffect(() => { cargar(); }, []);

  const handleDelete = async (id) => {
    try {
      const r = await fetch(`${API}/api/reloj/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Error al eliminar');
      setMsg({ ok: true, texto: 'Reloj eliminado correctamente' });
      cargar(); onCambio();
    } catch (err) { setMsg({ ok: false, texto: err.message }); }
    setConfirm(null);
  };

  const btnBase = { fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 3, cursor: 'pointer', padding: '8px 16px', transition: 'all 0.2s', border: 'none' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onVolver} style={{ ...btnBase, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', padding: '8px 18px' }}>← Volver a la tienda</button>
          <div style={{ width: 1, height: 22, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Emblem size={28} fg="var(--gold)" />
            <div>
              <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)' }}>Panel Admin</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{usuario?.nombre} {usuario?.apellido}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setUsuariosOpen(true)} style={{ ...btnBase, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', padding: '10px 20px' }}>Usuarios</button>
          <button onClick={() => setPedidosOpen(true)} style={{ ...btnBase, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', padding: '10px 20px' }}>Pedidos</button>
          <button onClick={() => setComponentesOpen(true)} style={{ ...btnBase, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', padding: '10px 20px' }}>Componentes</button>
          <button onClick={() => setModal({ modo: 'crear' })} style={{ ...btnBase, background: 'var(--ink)', color: 'var(--white)', padding: '10px 24px' }}>+ Agregar Reloj</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 48px' }}>
        <DashboardAdmin />

        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Gestión de Relojes</h1>
            <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>{relojes.length} modelos en el catálogo · {relojes.filter(r => r.stock === 0).length} agotados · {relojes.filter(r => r.stock > 0 && r.stock <= 3).length} con stock bajo</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {[['Total', relojes.length, 'var(--ink)'], ['Agotados', relojes.filter(r => r.stock === 0).length, '#dc2626'], ['Stock bajo', relojes.filter(r => r.stock > 0 && r.stock <= 3).length, '#d97706']].map(([label, val, color]) => (
              <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {msg.texto}
            <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600, fontSize: 14 }}>✕</button>
          </div>
        )}

        <div style={{ background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 80, color: 'var(--ink-4)', fontSize: 13 }}>Cargando catálogo...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--off-white)', borderBottom: '2px solid var(--border)' }}>
                  {['', 'Reloj', 'Marca', 'Modelo', 'Precio', 'Stock', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 8, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relojes.map((w, i) => {
                  const maq = w.movimientosCompatibles || [];
                  const pul = w.pulserasCompatibles || [];
                  const stockTotal = (maq.length && pul.length) ? Math.min(w.stock || 0, Math.max(...maq.map(m => m.stock)), Math.max(...pul.map(p => p.stock))) : (w.stock || 0);
                  return (
                  <tr key={w.id} style={{ borderBottom: i < relojes.length - 1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 16px', width: 64 }}>
                      {getImageUrl(w.imagenUrl)
                        ? <img src={getImageUrl(w.imagenUrl)} style={{ height: 50, width: 50, objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }} />
                        : <div style={{ width: 50, height: 50, borderRadius: 6, background: 'var(--warm-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Emblem size={28} fg="var(--border-dk)" /></div>
                      }
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{w.nombre}</div>
                      <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>ID #{w.id}</div>
                    </td>
                    <td style={{ padding: '10px 16px', fontSize: 11, color: 'var(--gold)', fontWeight: 600, letterSpacing: '0.06em' }}>{w.marca?.nombre || '—'}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-4)' }}>{w.modelo}</td>
                    <td style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>RD$ {w.precio.toLocaleString('es-DO')}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', background: stockTotal === 0 ? '#fee2e2' : stockTotal <= 3 ? '#fef9c3' : '#dcfce7', color: stockTotal === 0 ? '#dc2626' : stockTotal <= 3 ? '#854d0e' : '#166534' }}>
                        {stockTotal === 0 ? 'Agotado' : `${stockTotal} uds`}
                      </span>
                      <div style={{ fontSize: 9, color: 'var(--ink-4)', marginTop: 4 }}>{maq.length} maq · {pul.length} pul</div>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setVariantesReloj(w)} style={{ ...btnBase, background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-lt)' }}>Opciones</button>
                        <button onClick={() => setModal({ modo: 'editar', reloj: w })} style={{ ...btnBase, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)' }}>Editar</button>
                        <button onClick={() => setConfirm(w)} style={{ ...btnBase, background: 'transparent', color: 'var(--rose)', border: '1px solid rgba(176,112,85,0.35)' }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <RelojModal
          modo={modal.modo} reloj={modal.reloj} marcas={marcas}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargar(); onCambio(); setMsg({ ok: true, texto: modal.modo === 'crear' ? 'Reloj creado exitosamente' : 'Reloj actualizado exitosamente' }); }}
        />
      )}
      {variantesReloj && (
        <CompatibilidadModal reloj={variantesReloj} onClose={() => setVariantesReloj(null)} onCambio={() => { cargar(); onCambio(); }} />
      )}
      {componentesOpen && <ComponentesModal onClose={() => setComponentesOpen(false)} onCambio={() => cargar()} />}
      {pedidosOpen && <PedidosModal onClose={() => setPedidosOpen(false)} />}
      {usuariosOpen && <UsuariosModal onClose={() => setUsuariosOpen(false)} />}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: 12, padding: '36px 40px', maxWidth: 420, width: '100%', margin: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>¿Eliminar reloj?</div>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 28, lineHeight: 1.7 }}>
              Estás a punto de eliminar <strong style={{ color: 'var(--ink)' }}>{confirmDelete.nombre}</strong>.<br />Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirm(null)} style={{ flex: 1, padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ flex: 1, padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--rose)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
