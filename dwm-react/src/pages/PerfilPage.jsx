import React from 'react';
import Emblem from '../components/Emblem.jsx';
import Estrellas from '../components/Estrellas.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import PedidoItemResena from '../components/PedidoItemResena.jsx';
import HiloTicket from '../components/HiloTicket.jsx';
import { getImageUrl } from '../utils/getImageUrl.js';
import { validarPassword } from '../utils/validarPassword.js';
import { TARJETAS, detectarMarca, formatearTarjeta, formatearVence } from '../utils/tarjeta.js';
import { estadoColor, estadoTicketColor } from '../utils/estados.js';
import {
  actualizarPerfil, getPedidos, getTarjetas, guardarTarjeta, borrarTarjeta,
  getTickets, crearTicket, getFavoritos, removeFavorito, uploadImagen,
} from '../services/api.js';

// Perfil del cliente: mis datos, mis pedidos (con reseña), tarjetas, favoritos y soporte.
export default function PerfilPage({ usuario, onActualizar, onVolver, onLogout }) {
  const [tab, setTab] = React.useState('datos');
  const inp = { width: '100%', padding: '11px 13px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 };
  const field = (label, node) => <div style={{ marginBottom: 14 }}><label style={lbl}>{label}</label>{node}</div>;

  // ---- Mis datos ----
  const [form, setForm] = React.useState({ nombre: usuario.nombre || '', apellido: usuario.apellido || '', telefono: usuario.telefono || '', direccion: usuario.direccion || '', dobleFactor: usuario.dobleFactor || false });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [msgDatos, setMsgDatos] = React.useState(null);
  const guardarDatos = async (e) => {
    e.preventDefault(); setMsgDatos(null);
    const { ok, data } = await actualizarPerfil(usuario.id, { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, direccion: form.direccion, dobleFactor: form.dobleFactor });
    if (ok) { onActualizar(data); setMsgDatos({ ok: true, texto: 'Perfil actualizado' }); }
    else setMsgDatos({ ok: false, texto: data.mensaje || 'Error al guardar' });
  };

  // ---- Cambiar contrasena ----
  const [pwForm, setPwForm] = React.useState({ actual: '', nueva: '', repetir: '' });
  const pwset = (k, v) => setPwForm(f => ({ ...f, [k]: v }));
  const [msgPw, setMsgPw] = React.useState(null);
  const cambiarPassword = async (e) => {
    e.preventDefault(); setMsgPw(null);
    const errPwd = validarPassword(pwForm.nueva);
    if (errPwd) { setMsgPw({ ok: false, texto: errPwd }); return; }
    if (pwForm.nueva !== pwForm.repetir) { setMsgPw({ ok: false, texto: 'Las contrasenas no coinciden' }); return; }
    const { ok, data } = await actualizarPerfil(usuario.id, { nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, direccion: form.direccion, dobleFactor: form.dobleFactor, password: pwForm.nueva, passwordActual: pwForm.actual });
    if (ok) { onActualizar(data); setPwForm({ actual: '', nueva: '', repetir: '' }); setMsgPw({ ok: true, texto: 'Contrasena actualizada' }); }
    else setMsgPw({ ok: false, texto: data.mensaje || 'Error al cambiar la contrasena' });
  };

  // ---- Mis pedidos ----
  const [pedidos, setPedidos] = React.useState([]);
  const [cargandoP, setCargandoP] = React.useState(false);
  const [filtro, setFiltro] = React.useState('Todos');
  const [abierto, setAbierto] = React.useState(null);
  const cargarPedidos = () => { setCargandoP(true); getPedidos(usuario.id).then(d => { setPedidos(d); setCargandoP(false); }).catch(() => setCargandoP(false)); };
  React.useEffect(() => { if (tab === 'pedidos') cargarPedidos(); }, [tab]);
  const pedidosFiltrados = filtro === 'Todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  // ---- Mis tarjetas ----
  const [tarjetas, setTarjetas] = React.useState([]);
  const [tForm, setTForm] = React.useState({ numero: '', titular: '', vence: '', cvv: '' });
  const [msgT, setMsgT] = React.useState(null);
  const tset = (k, v) => setTForm(f => ({ ...f, [k]: v }));
  const marcaTar = detectarMarca(tForm.numero);
  const cargarTarjetas = () => { getTarjetas(usuario.id).then(setTarjetas).catch(() => {}); };
  React.useEffect(() => { if (tab === 'tarjetas') cargarTarjetas(); }, [tab]);
  const enviarTarjeta = async (e) => {
    e.preventDefault(); setMsgT(null);
    const digitos = tForm.numero.replace(/\D/g, '');
    if (!marcaTar || digitos.length !== marcaTar.largo) { setMsgT({ ok: false, texto: `El numero debe tener ${marcaTar ? marcaTar.largo : 16} digitos` }); return; }
    const { ok } = await guardarTarjeta({ usuarioId: usuario.id, marca: marcaTar.marca, ultimos4: digitos.slice(-4), vence: tForm.vence, titular: tForm.titular });
    if (ok) { setTForm({ numero: '', titular: '', vence: '', cvv: '' }); setMsgT({ ok: true, texto: 'Tarjeta guardada' }); cargarTarjetas(); }
    else setMsgT({ ok: false, texto: 'Error al guardar' });
  };
  const eliminarTarjeta = async (id) => { await borrarTarjeta(id); cargarTarjetas(); };

  // ---- Soporte (tickets del cliente) ----
  const [tickets, setTickets]         = React.useState([]);
  const [ticketForm, setTicketForm]   = React.useState({ pedidoId: '', asunto: '', descripcion: '', prioridad: 'Media', imagenUrl: '' });
  const [ticketPrev, setTicketPrev]   = React.useState(null);
  const [msgTicket, setMsgTicket]     = React.useState(null);
  const [abiertoTicket, setAbiertoTicket] = React.useState(null);
  const tkset = (k, v) => setTicketForm(f => ({ ...f, [k]: v }));
  const cargarTickets = () => getTickets(usuario.id).then(setTickets).catch(() => {});
  React.useEffect(() => { if (tab === 'soporte') { cargarTickets(); if (pedidos.length === 0) cargarPedidos(); } }, [tab]);
  const enviarTicket = async (e) => {
    e.preventDefault(); setMsgTicket(null);
    const { ok } = await crearTicket({ usuarioId: usuario.id, nombreCliente: `${usuario.nombre} ${usuario.apellido}`, email: usuario.email, pedidoId: ticketForm.pedidoId ? parseInt(ticketForm.pedidoId) : null, asunto: ticketForm.asunto, descripcion: ticketForm.descripcion, prioridad: ticketForm.prioridad, imagenUrl: ticketForm.imagenUrl || null });
    if (ok) { setTicketForm({ pedidoId: '', asunto: '', descripcion: '', prioridad: 'Media', imagenUrl: '' }); setTicketPrev(null); setMsgTicket({ ok: true, texto: 'Ticket enviado. Te responderemos por aqui.' }); cargarTickets(); }
    else setMsgTicket({ ok: false, texto: 'Error al crear el ticket' });
  };

  // ---- Favoritos ----
  const [favoritos, setFavoritos] = React.useState([]);
  const cargarFavoritos = () => getFavoritos(usuario.id).then(setFavoritos).catch(() => {});
  React.useEffect(() => { if (tab === 'favoritos') cargarFavoritos(); }, [tab]);
  const quitarFavorito = async (relojId) => { await removeFavorito(usuario.id, relojId); cargarFavoritos(); };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', padding: '12px 4px', color: tab === id ? 'var(--ink)' : 'var(--ink-4)', borderBottom: tab === id ? '2px solid var(--gold)' : '2px solid transparent', marginBottom: -1 }}>{label}</button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem size={30} fg="var(--gold)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Mi Perfil</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onVolver} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>← Tienda</button>
          <button onClick={onLogout} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--rose)', border: '1px solid rgba(176,112,85,0.35)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>Cerrar sesion</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '36px 48px' }}>
        <div style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Cuenta</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Hola, {usuario.nombre}</h1>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20 }}>{usuario.email}</div>

        <div style={{ display: 'flex', gap: 22, borderBottom: '1px solid var(--border)', marginBottom: 26 }}>
          {tabBtn('datos', 'Mis datos')}
          {tabBtn('pedidos', 'Mis pedidos')}
          {tabBtn('tarjetas', 'Mis tarjetas')}
          {tabBtn('favoritos', 'Favoritos')}
          {tabBtn('soporte', 'Soporte')}
        </div>

        {/* ---- Datos ---- */}
        {tab === 'datos' && (
          <div style={{ maxWidth: 560 }}>
            <form onSubmit={guardarDatos} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 30px', marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Datos personales</div>
              {msgDatos && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 12, background: msgDatos.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgDatos.ok ? '#bbf7d0' : '#fecaca'}`, color: msgDatos.ok ? '#166534' : '#dc2626' }}>{msgDatos.texto}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {field('Nombre', <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={inp} />)}
                {field('Apellido', <input value={form.apellido} onChange={e => set('apellido', e.target.value)} required style={inp} />)}
              </div>
              {field('Correo (no editable)', <input value={usuario.email} disabled style={{ ...inp, background: 'var(--off-white)', color: 'var(--ink-4)' }} />)}
              {field('Telefono', <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="809-555-0101" style={inp} />)}
              {field('Direccion', <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Winston Churchill, SD" style={inp} />)}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0 16px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.dobleFactor} onChange={e => set('dobleFactor', e.target.checked)} />
                <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>Verificacion en dos pasos (2FA): recibir un codigo al iniciar sesion</span>
              </label>
              <button type="submit" style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer', marginTop: 6 }}>Guardar cambios</button>
            </form>

            <form onSubmit={cambiarPassword} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 30px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Cambiar contrasena</div>
              {msgPw && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 12, background: msgPw.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgPw.ok ? '#bbf7d0' : '#fecaca'}`, color: msgPw.ok ? '#166534' : '#dc2626' }}>{msgPw.texto}</div>}
              {field('Contrasena actual', <PasswordInput value={pwForm.actual} onChange={e => pwset('actual', e.target.value)} required style={inp} />)}
              {field('Nueva contrasena', <PasswordInput value={pwForm.nueva} onChange={e => pwset('nueva', e.target.value)} required style={inp} />)}
              {field('Repetir contrasena', <PasswordInput value={pwForm.repetir} onChange={e => pwset('repetir', e.target.value)} required style={inp} />)}
              <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.6, background: 'var(--off-white)', borderRadius: 8, padding: '11px 13px', marginBottom: 14 }}>
                <strong style={{ color: 'var(--ink)' }}>Requisitos:</strong> la contrasena debe tener al menos <strong>8 caracteres</strong>, con una letra <strong>mayuscula</strong>, una <strong>minuscula</strong> y un <strong>numero</strong>.
              </div>
              <button type="submit" style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Actualizar contrasena</button>
            </form>
          </div>
        )}

        {/* ---- Pedidos ---- */}
        {tab === 'pedidos' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {['Todos', 'Pendiente', 'En proceso', 'Enviado', 'Completado'].map(f => (
                <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 9999, cursor: 'pointer', background: filtro === f ? 'var(--ink)' : 'transparent', color: filtro === f ? 'var(--white)' : 'var(--ink-3)', border: filtro === f ? '1px solid var(--ink)' : '1px solid var(--border-dk)' }}>{f}</button>
              ))}
            </div>
            {cargandoP ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-4)' }}>Cargando...</div>
              : pedidosFiltrados.length === 0 ? <div style={{ textAlign: 'center', padding: 50, color: 'var(--ink-4)', fontSize: 13, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12 }}>No tienes pedidos {filtro !== 'Todos' ? `en estado "${filtro}"` : 'todavia'}.</div>
              : pedidosFiltrados.map(p => (
                <div key={p.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                  <div onClick={() => setAbierto(abierto === p.id ? null : p.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', cursor: 'pointer' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Pedido #{p.id}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 10 }}>{new Date(p.fecha).toLocaleDateString('es-DO')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 9999, color: 'var(--white)', background: estadoColor(p.estado) }}>{p.estado}</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>RD$ {p.total.toLocaleString('es-DO')}</span>
                    </div>
                  </div>
                  {abierto === p.id && (
                    <div style={{ padding: '0 18px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                      {p.items.map(i => <PedidoItemResena key={i.id} item={i} usuario={usuario} />)}
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--ink-4)' }}>Envio: {p.direccion}, {p.ciudad}, {p.provincia} · Pago: {p.metodoPago}</div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* ---- Tarjetas ---- */}
        {tab === 'tarjetas' && (
          <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>Guardadas</div>
              {tarjetas.length === 0 ? <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>No tienes tarjetas guardadas.</p>
                : tarjetas.map(t => {
                  const m = TARJETAS.find(x => x.marca === t.marca);
                  return (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 10 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--white)', background: m ? m.color : 'var(--ink-3)', padding: '4px 8px', borderRadius: 4 }}>{t.marca}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink)' }}>•••• {t.ultimos4}</div>
                        <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{t.titular} · vence {t.vence}</div>
                      </div>
                      <button onClick={() => eliminarTarjeta(t.id)} style={{ fontSize: 8.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}>Eliminar</button>
                    </div>
                  );
                })}
            </div>
            <form onSubmit={enviarTarjeta} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Agregar tarjeta</div>
              {msgT && <div style={{ padding: '9px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12, background: msgT.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgT.ok ? '#bbf7d0' : '#fecaca'}`, color: msgT.ok ? '#166534' : '#dc2626' }}>{msgT.texto}</div>}
              <label style={lbl}>Numero</label>
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input value={tForm.numero} onChange={e => tset('numero', formatearTarjeta(e.target.value))} placeholder="0000 0000 0000 0000" style={{ ...inp, paddingRight: 88, fontFamily: 'var(--mono)' }} />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                  {marcaTar ? <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--white)', background: marcaTar.color, padding: '4px 8px', borderRadius: 4 }}>{marcaTar.marca}</span> : null}
                </span>
              </div>
              {field('Titular', <input value={tForm.titular} onChange={e => tset('titular', e.target.value)} placeholder="CLIENTE DEMO" style={inp} />)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {field('Vence', <input value={tForm.vence} onChange={e => tset('vence', formatearVence(e.target.value))} placeholder="MM/AA" maxLength={5} style={inp} />)}
                {field('CVV (no se guarda)', <input value={tForm.cvv} onChange={e => tset('cvv', e.target.value.replace(/\D/g, '').slice(0, marcaTar ? marcaTar.cvv : 4))} placeholder="123" style={inp} />)}
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Guardar tarjeta</button>
              <p style={{ fontSize: 9.5, color: 'var(--ink-4)', marginTop: 8 }}>Solo se guarda marca, ultimos 4 digitos, vencimiento y titular.</p>
            </form>
          </div>
        )}

        {/* ---- Soporte (tickets) ---- */}
        {tab === 'soporte' && (
          <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 12 }}>Mis tickets</div>
              {tickets.length === 0 ? <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>No tienes tickets todavia.</p>
                : tickets.map(t => (
                  <div key={t.id} onClick={() => setAbiertoTicket(t.id)} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t.asunto}</div><div style={{ fontSize: 10, color: 'var(--ink-4)' }}>#{t.id}{t.pedidoId ? ` · Pedido #${t.pedidoId}` : ''} · {t.mensajes.length} msg</div></div>
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 9999, color: 'var(--white)', background: estadoTicketColor(t.estado) }}>{t.estado}</span>
                  </div>
                ))}
            </div>
            <form onSubmit={enviarTicket} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>Reportar un problema</div>
              {msgTicket && <div style={{ padding: '9px 12px', borderRadius: 6, marginBottom: 12, fontSize: 12, background: msgTicket.ok ? '#f0fdf4' : '#fff5f5', border: `1px solid ${msgTicket.ok ? '#bbf7d0' : '#fecaca'}`, color: msgTicket.ok ? '#166534' : '#dc2626' }}>{msgTicket.texto}</div>}
              {field('Pedido (opcional)', <select value={ticketForm.pedidoId} onChange={e => tkset('pedidoId', e.target.value)} style={inp}><option value="">Sin pedido</option>{pedidos.map(p => <option key={p.id} value={p.id}>Pedido #{p.id} — RD$ {p.total.toLocaleString('es-DO')}</option>)}</select>)}
              {field('Asunto', <input value={ticketForm.asunto} onChange={e => tkset('asunto', e.target.value)} required placeholder="Problema con mi pedido" style={inp} />)}
              {field('Prioridad', <select value={ticketForm.prioridad} onChange={e => tkset('prioridad', e.target.value)} style={inp}><option>Baja</option><option>Media</option><option>Alta</option></select>)}
              {field('Descripcion', <textarea value={ticketForm.descripcion} onChange={e => tkset('descripcion', e.target.value)} required rows={3} placeholder="Explica el problema con detalle..." style={{ ...inp, resize: 'vertical' }} />)}
              {field('Imagen (opcional)', <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px dashed var(--border-dk)', borderRadius: 4, cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={async ev => { const f = ev.target.files[0]; if (f) { try { const u = await uploadImagen(f); tkset('imagenUrl', u.url); setTicketPrev(URL.createObjectURL(f)); } catch (e) {} } }} style={{ display: 'none' }} />
                {ticketPrev ? <img src={ticketPrev} style={{ height: 40, objectFit: 'contain' }} /> : <span style={{ fontSize: 18, color: 'var(--ink-4)' }}>+</span>}
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{ticketForm.imagenUrl ? 'Imagen lista' : 'Adjuntar foto'}</span>
              </label>)}
              <button type="submit" style={{ width: '100%', padding: '12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Enviar ticket</button>
            </form>
          </div>
        )}

        {/* ---- Favoritos ---- */}
        {tab === 'favoritos' && (
          <div>
            {favoritos.length === 0 ? <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>No tienes favoritos. Marca relojes con el ♥ en el catalogo.</p>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
                  {favoritos.map(r => {
                    const rese = r.resenas || [];
                    const rprom = rese.length ? rese.reduce((s, x) => s + x.calificacion, 0) / rese.length : 0;
                    return (
                      <div key={r.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: 130, background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getImageUrl(r.imagenUrl) ? <img src={getImageUrl(r.imagenUrl)} alt={r.nombre} style={{ maxHeight: 120, maxWidth: '85%', objectFit: 'contain' }} /> : <Emblem size={40} fg="var(--border-dk)" />}
                        </div>
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)' }}>{r.marca?.nombre || ''}</div>
                          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink)', margin: '2px 0 4px' }}>{r.nombre}</div>
                          {rese.length > 0 && <div style={{ marginBottom: 4 }}><Estrellas valor={rprom} tam={11} /></div>}
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>RD$ {r.precio.toLocaleString('es-DO')}</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { window.location.hash = '#/producto/' + r.id; }} style={{ flex: 1, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '8px', cursor: 'pointer' }}>Ver</button>
                            <button onClick={() => quitarFavorito(r.id)} style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'transparent', color: 'var(--rose)', border: '1px solid rgba(176,112,85,0.35)', borderRadius: 3, padding: '8px 10px', cursor: 'pointer' }}>Quitar</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>}
          </div>
        )}
      </div>
      {abiertoTicket && <HiloTicket ticketId={abiertoTicket} autor={usuario.nombre} esSoporte={false} permiteEstado={false} onClose={() => setAbiertoTicket(null)} onCambio={cargarTickets} />}
    </div>
  );
}
