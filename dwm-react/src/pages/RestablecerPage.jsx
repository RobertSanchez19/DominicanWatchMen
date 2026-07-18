import React from 'react';
import PasswordInput from '../components/PasswordInput.jsx';
import { validarPassword, REQ_PASSWORD } from '../utils/validarPassword.js';
import { restablecer } from '../services/api.js';

// Pagina abierta desde el enlace del correo: define la nueva contraseña con el token.
export default function RestablecerPage({ token, onListo }) {
  const [nueva, setNueva]     = React.useState('');
  const [repetir, setRepetir] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg]         = React.useState(null);
  const [done, setDone]       = React.useState(false);

  const inp = { width: '100%', padding: '12px 14px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 };

  const enviar = async (e) => {
    e.preventDefault(); setMsg(null);
    const errPwd = validarPassword(nueva);
    if (errPwd) { setMsg({ ok: false, texto: errPwd }); return; }
    if (nueva !== repetir) { setMsg({ ok: false, texto: 'Las contraseñas no coinciden' }); return; }
    setLoading(true);
    const { ok, data } = await restablecer(token, nueva);
    setLoading(false);
    if (ok) setDone(true);
    else setMsg({ ok: false, texto: data.mensaje || 'No se pudo restablecer la contraseña' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '40px 36px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Dominican Watch Men</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>Nueva contraseña</div>

        {msg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 12, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626' }}>{msg.texto}</div>}

        {done ? (
          <>
            <div style={{ padding: '12px 14px', borderRadius: 6, marginBottom: 20, fontSize: 13, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con la nueva.</div>
            <button onClick={onListo} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Ir a Iniciar Sesión</button>
          </>
        ) : (
          <form onSubmit={enviar}>
            <div style={{ marginBottom: 14 }}><label style={lbl}>Nueva Contraseña</label><PasswordInput value={nueva} onChange={e => setNueva(e.target.value)} required style={inp} /><div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 5 }}>{REQ_PASSWORD}</div></div>
            <div style={{ marginBottom: 18 }}><label style={lbl}>Confirmar Contraseña</label><PasswordInput value={repetir} onChange={e => setRepetir(e.target.value)} required style={{ ...inp, ...(repetir && nueva !== repetir ? { borderColor: 'var(--rose)' } : {}) }} />{repetir && nueva !== repetir && <div style={{ fontSize: 10, color: 'var(--rose)', marginTop: 5 }}>Las contraseñas no coinciden</div>}</div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Guardando...' : 'Restablecer Contraseña'}</button>
            <button type="button" onClick={onListo} style={{ width: '100%', padding: '10px', marginTop: 10, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: 'none', cursor: 'pointer' }}>Cancelar</button>
          </form>
        )}
      </div>
    </div>
  );
}
