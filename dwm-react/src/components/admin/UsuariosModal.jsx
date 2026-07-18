import React from 'react';
import { API } from '../../config/api.js';

// Modal de usuarios y roles: el admin asigna Cliente/Admin/Fabricante/Soporte.
export default function UsuariosModal({ onClose }) {
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [msg, setMsg]           = React.useState(null);
  const roles = ['Cliente', 'Admin', 'Fabricante', 'Soporte'];

  const cargar = () => { fetch(`${API}/api/usuario`).then(r => r.json()).then(d => { setUsuarios(d); setLoading(false); }).catch(() => setLoading(false)); };
  React.useEffect(() => { cargar(); }, []);

  const cambiarRol = async (id, rol) => {
    setMsg(null);
    try {
      const r = await fetch(`${API}/api/usuario/${id}/rol`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rol }) });
      if (!r.ok) throw new Error();
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol } : u));
      setMsg({ ok: true, texto: 'Rol actualizado' });
    } catch (e) { setMsg({ ok: false, texto: 'Error al cambiar el rol' }); }
  };

  const colorRol = (r) => r === 'Admin' ? 'var(--ink)' : r === 'Fabricante' ? 'var(--navy, #1B3461)' : r === 'Soporte' ? 'var(--rose, #B07055)' : 'var(--ink-4)';

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(17,17,16,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '30px 34px', width: '100%', maxWidth: 700, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.24)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Gestion de acceso</div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>Usuarios y roles</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-3)' }}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16 }}>Cliente compra; Admin gestiona todo; Fabricante ve/usa el taller; Soporte atiende los tickets.</p>
        {msg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626' }}>{msg.texto}</div>}
        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Cargando...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--off-white)' }}>
                {['Usuario', 'Correo', 'Rol'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{u.nombre} {u.apellido}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink-3)' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)} style={{ padding: '6px 10px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--sans)', background: 'var(--white)', color: colorRol(u.rol), fontWeight: 600 }}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
