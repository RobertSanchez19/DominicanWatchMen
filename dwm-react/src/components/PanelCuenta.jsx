import React from 'react';
import PasswordInput from './PasswordInput.jsx';
import { validarPassword, REQ_PASSWORD } from '../utils/validarPassword.js';
import { login, verificar2FA, recuperar, registro, getMarcas, uploadImagen, crearReloj } from '../services/api.js';

// Panel lateral de cuenta: login, registro, verificacion en dos pasos (2FA),
// recuperar contraseña y, si es admin, un formulario rapido para agregar reloj.
export default function PanelCuenta({ open, onClose, usuario, onLogin, onLogout, onRelojCreado }) {
  const [tab, setTab]         = React.useState('login');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg]         = React.useState(null);
  const [marcas, setMarcas]   = React.useState([]);
  const [imagen, setImagen]   = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [adminMsg, setAdminMsg] = React.useState(null);
  const [adminLoading, setAdminLoading] = React.useState(false);

  const [loginForm, setLoginForm]     = React.useState({ email: '', password: '' });
  const [regForm, setRegForm]         = React.useState({ nombre: '', apellido: '', email: '', password: '', confirmar: '', telefono: '', direccion: '' });
  const [dosFA, setDosFA]             = React.useState(null);
  const [codigo2FA, setCodigo2FA]     = React.useState('');
  const [recPaso, setRecPaso]         = React.useState(null);
  const [recForm, setRecForm]         = React.useState({ email: '' });
  const [recEnlaceDemo, setRecEnlaceDemo] = React.useState(null);
  const [relojForm, setRelojForm]     = React.useState({ nombre: '', modelo: '', precio: '', stock: '', marcaId: '' });

  React.useEffect(() => {
    if (usuario?.esAdmin && marcas.length === 0)
      getMarcas().then(setMarcas).catch(() => {});
  }, [usuario]);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const { ok, data } = await login(loginForm);
    setLoading(false);
    if (!ok) { setMsg({ ok: false, texto: data.mensaje || 'Error al iniciar sesión' }); return; }
    if (data.requiere2FA) {
      setDosFA({ usuarioId: data.usuarioId, demo: data.demo, codigoDemo: data.codigoDemo });
      setMsg(data.demo
        ? { ok: true, texto: `Modo demo: tu código de acceso es ${data.codigoDemo}` }
        : { ok: true, texto: 'Te enviamos un código de acceso a tu correo.' });
      return;
    }
    onLogin(data);
  };

  const handleVerificar2FA = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const { ok, data } = await verificar2FA(dosFA.usuarioId, codigo2FA);
    setLoading(false);
    if (!ok) { setMsg({ ok: false, texto: data.mensaje || 'Código inválido' }); return; }
    setDosFA(null); setCodigo2FA('');
    onLogin(data);
  };

  const handleRecuperar = async (e) => {
    e.preventDefault(); setLoading(true); setMsg(null);
    const { ok, data } = await recuperar(recForm.email);
    setLoading(false);
    if (!ok) { setMsg({ ok: false, texto: data.mensaje || 'Error al enviar el enlace' }); return; }
    setRecPaso('enviado');
    setRecEnlaceDemo(data.demo ? data.enlaceDemo : null);
    setMsg({ ok: true, texto: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).' });
  };

  const handleRegistro = async (e) => {
    e.preventDefault(); setMsg(null);
    const errPwd = validarPassword(regForm.password);
    if (errPwd) { setMsg({ ok: false, texto: errPwd }); return; }
    if (regForm.password !== regForm.confirmar) { setMsg({ ok: false, texto: 'Las contraseñas no coinciden' }); return; }
    setLoading(true);
    const { confirmar, ...payload } = regForm;
    const { ok, data } = await registro(payload);
    setLoading(false);
    if (!ok) { setMsg({ ok: false, texto: data.mensaje || 'Error al registrarse' }); return; }
    onLogin(data);
  };

  const handleAgregarReloj = async (e) => {
    e.preventDefault(); setAdminLoading(true); setAdminMsg(null);
    try {
      let imagenUrl = null;
      if (imagen) imagenUrl = (await uploadImagen(imagen)).url;
      const { ok, data } = await crearReloj({ ...relojForm, precio: parseFloat(relojForm.precio), stock: parseInt(relojForm.stock), marcaId: parseInt(relojForm.marcaId), imagenUrl });
      if (!ok) throw new Error(data.mensaje || 'Error al crear el reloj');
      setAdminMsg({ ok: true, texto: `"${data.nombre}" agregado exitosamente` });
      setRelojForm({ nombre: '', modelo: '', precio: '', stock: '', marcaId: '' });
      setImagen(null); setPreview(null);
      onRelojCreado();
    } catch (err) { setAdminMsg({ ok: false, texto: err.message }); }
    finally { setAdminLoading(false); }
  };

  const inp = { width: '100%', padding: '11px 13px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 };
  const field = (children) => <div style={{ marginBottom: 14 }}>{children}</div>;

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(17,17,16,0.5)', backdropFilter: 'blur(6px)' }} />

      <div style={{
        position: 'relative', zIndex: 1, width: 420, height: '100%',
        background: 'var(--white)', boxShadow: '-24px 0 60px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Dominican Watch Men</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>
              {usuario ? `Hola, ${usuario.nombre}` : 'Mi Cuenta'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--ink-3)', padding: 6 }}>✕</button>
        </div>

        <div style={{ padding: '24px 32px', flex: 1 }}>

          {/* ── LOGUEADO ── */}
          {usuario && (
            <>
              <div style={{ background: 'var(--off-white)', borderRadius: 10, padding: '20px', marginBottom: 24, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gold-pale)', border: '1px solid var(--gold-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--gold)', fontWeight: 600 }}>{usuario.nombre[0]}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{usuario.nombre} {usuario.apellido}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{usuario.email}</div>
                    {usuario.esAdmin && (
                      <span style={{ display: 'inline-block', marginTop: 4, fontSize: 7.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', padding: '3px 8px', borderRadius: 2 }}>Administrador</span>
                    )}
                  </div>
                </div>
              </div>

              {usuario.esAdmin && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ width: 16, height: 1, background: 'var(--gold)', display: 'block' }} />
                    <span style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)' }}>Panel Admin</span>
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>Agregar Reloj</div>

                  <form onSubmit={handleAgregarReloj}>
                    {field(<><label style={lbl}>Marca</label>
                      <select value={relojForm.marcaId} onChange={e => setRelojForm({...relojForm, marcaId: e.target.value})} required style={inp}>
                        <option value="">Selecciona una marca</option>
                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                      </select></>)}
                    {field(<><label style={lbl}>Nombre</label><input value={relojForm.nombre} onChange={e => setRelojForm({...relojForm, nombre: e.target.value})} required placeholder="Submariner Mod" style={inp} /></>)}
                    {field(<><label style={lbl}>Modelo</label><input value={relojForm.modelo} onChange={e => setRelojForm({...relojForm, modelo: e.target.value})} required placeholder="NH35-SUB-BK" style={inp} /></>)}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div><label style={lbl}>Precio (RD$)</label><input type="number" value={relojForm.precio} onChange={e => setRelojForm({...relojForm, precio: e.target.value})} required min="0" step="0.01" placeholder="12500" style={inp} /></div>
                      <div><label style={lbl}>Stock</label><input type="number" value={relojForm.stock} onChange={e => setRelojForm({...relojForm, stock: e.target.value})} required min="0" placeholder="5" style={inp} /></div>
                    </div>
                    {field(<>
                      <label style={lbl}>Imagen</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px dashed var(--border-dk)', borderRadius: 4, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-dk)'}>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if(f){ setImagen(f); setPreview(URL.createObjectURL(f)); }}} style={{ display: 'none' }} />
                        {preview ? <img src={preview} style={{ height: 48, objectFit: 'contain' }} /> : <span style={{ fontSize: 20, color: 'var(--ink-4)' }}>+</span>}
                        <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{imagen ? imagen.name : 'Seleccionar imagen'}</span>
                      </label>
                    </>)}
                    {adminMsg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 12, fontSize: 12, background: adminMsg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${adminMsg.ok ? '#bbf7d0' : '#fecaca'}`, color: adminMsg.ok ? '#166534' : '#dc2626' }}>{adminMsg.texto}</div>}
                    <button type="submit" disabled={adminLoading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: adminLoading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: adminLoading ? 'not-allowed' : 'pointer' }}>
                      {adminLoading ? 'Guardando...' : 'Agregar a la Colección'}
                    </button>
                  </form>
                </div>
              )}

              <button onClick={onLogout} style={{ width: '100%', padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rose)'; e.currentTarget.style.color = 'var(--rose)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dk)'; e.currentTarget.style.color = 'var(--ink-3)'; }}>
                Cerrar Sesión
              </button>
            </>
          )}

          {/* ── NO LOGUEADO ── */}
          {!usuario && (
            <>
              {msg && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 12, background: msg.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}`, color: msg.ok ? '#166534' : '#dc2626' }}>{msg.texto}</div>}

              {/* ── 2FA ── */}
              {dosFA && (
                <form onSubmit={handleVerificar2FA}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Verificación en dos pasos</div>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.6 }}>Ingresa el código de 6 dígitos que enviamos a tu correo.</p>
                  {field(<><label style={lbl}>Código de acceso</label><input value={codigo2FA} onChange={e => setCodigo2FA(e.target.value)} required placeholder="000000" maxLength={6} style={{ ...inp, letterSpacing: '0.3em', textAlign: 'center', fontSize: 18 }} /></>)}
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                    {loading ? 'Verificando...' : 'Verificar y Entrar'}
                  </button>
                  <button type="button" onClick={() => { setDosFA(null); setCodigo2FA(''); setMsg(null); }} style={{ width: '100%', padding: '10px', marginTop: 10, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                </form>
              )}

              {/* ── Recuperar contraseña ── */}
              {!dosFA && recPaso && (
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>Recuperar contraseña</div>
                  {recPaso === 'email' ? (
                    <form onSubmit={handleRecuperar}>
                      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 18, lineHeight: 1.6 }}>Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
                      {field(<><label style={lbl}>Correo Electrónico</label><input type="email" value={recForm.email} onChange={e => setRecForm({ email: e.target.value })} required placeholder="correo@email.com" style={inp} /></>)}
                      <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                        {loading ? 'Enviando...' : 'Enviar Enlace'}
                      </button>
                    </form>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.6 }}>Haz clic en el enlace del correo para crear tu nueva contraseña. El enlace vence en 30 minutos.</p>
                      {recEnlaceDemo && <div style={{ padding: '12px 14px', borderRadius: 6, marginBottom: 14, fontSize: 12, background: 'var(--off-white)', border: '1px solid var(--border)', color: 'var(--ink-2)', wordBreak: 'break-all' }}>Modo demo (sin correo real): <a href={recEnlaceDemo} style={{ color: 'var(--gold)' }}>abrir enlace de restablecimiento</a></div>}
                    </>
                  )}
                  <button type="button" onClick={() => { setRecPaso(null); setRecForm({ email: '' }); setRecEnlaceDemo(null); setMsg(null); }} style={{ width: '100%', padding: '10px', marginTop: 10, fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: 'none', cursor: 'pointer' }}>Volver a Iniciar Sesión</button>
                </div>
              )}

              {/* ── Login / Registro ── */}
              {!dosFA && !recPaso && (<>
              <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
                {[['login', 'Iniciar Sesión'], ['registro', 'Crear Cuenta']].map(([key, label]) => (
                  <button key={key} onClick={() => { setTab(key); setMsg(null); }} style={{
                    flex: 1, padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
                    textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer',
                    color: tab === key ? 'var(--ink)' : 'var(--ink-4)',
                    borderBottom: tab === key ? '2px solid var(--gold)' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>

              {tab === 'login' && (
                <form onSubmit={handleLogin}>
                  {field(<><label style={lbl}>Correo Electrónico</label><input type="email" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required placeholder="correo@email.com" style={inp} /></>)}
                  {field(<><label style={lbl}>Contraseña</label><PasswordInput value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required style={inp} /></>)}
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                    {loading ? 'Verificando...' : 'Iniciar Sesión'}
                  </button>
                  <button type="button" onClick={() => { setRecPaso('email'); setRecForm({ email: loginForm.email }); setRecEnlaceDemo(null); setMsg(null); }} style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: 14, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--ink-3)', textDecoration: 'underline' }}>¿Olvidaste tu contraseña?</button>
                </form>
              )}

              {tab === 'registro' && (
                <form onSubmit={handleRegistro}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div><label style={lbl}>Nombre</label><input value={regForm.nombre} onChange={e => setRegForm({...regForm, nombre: e.target.value})} required placeholder="Carlos" style={inp} /></div>
                    <div><label style={lbl}>Apellido</label><input value={regForm.apellido} onChange={e => setRegForm({...regForm, apellido: e.target.value})} required placeholder="Martínez" style={inp} /></div>
                  </div>
                  {field(<><label style={lbl}>Correo Electrónico</label><input type="email" value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required placeholder="correo@email.com" style={inp} /></>)}
                  {field(<><label style={lbl}>Contraseña</label><PasswordInput value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required style={inp} /><div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 5 }}>{REQ_PASSWORD}</div></>)}
                  {field(<><label style={lbl}>Confirmar Contraseña</label><PasswordInput value={regForm.confirmar} onChange={e => setRegForm({...regForm, confirmar: e.target.value})} required style={{ ...inp, ...(regForm.confirmar && regForm.password !== regForm.confirmar ? { borderColor: 'var(--rose)' } : {}) }} />{regForm.confirmar && regForm.password !== regForm.confirmar && <div style={{ fontSize: 10, color: 'var(--rose)', marginTop: 5 }}>Las contraseñas no coinciden</div>}</>)}
                  {field(<><label style={lbl}>Teléfono</label><input value={regForm.telefono} onChange={e => setRegForm({...regForm, telefono: e.target.value})} placeholder="809-555-0101" style={inp} /></>)}
                  {field(<><label style={lbl}>Dirección</label><input value={regForm.direccion} onChange={e => setRegForm({...regForm, direccion: e.target.value})} placeholder="Av. Winston Churchill, SD" style={inp} /></>)}
                  <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: loading ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
                    {loading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}
                  </button>
                </form>
              )}
              </>)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
