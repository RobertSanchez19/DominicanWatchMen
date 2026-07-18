import React from 'react';
import Emblem from '../components/Emblem.jsx';
import { detectarMarca, formatearTarjeta, formatearVence } from '../utils/tarjeta.js';
import { validarCupon, crearPedido } from '../services/api.js';

// Pagina de checkout: 4 pasos (datos, envio, pago, resumen). Calcula cupon,
// ITBIS 18% y envio, y crea el pedido con el servicio del API.
export default function CheckoutPage({ items, usuario, onVolver, onConfirmado }) {
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const unidades = items.reduce((s, i) => s + i.cantidad, 0);
  const [paso, setPaso]         = React.useState(1);
  const [cupon, setCupon]       = React.useState(null);
  const [cuponInput, setCuponInput] = React.useState('');
  const [cuponMsg, setCuponMsg] = React.useState(null);
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError]       = React.useState(null);
  const [form, setForm] = React.useState({
    nombreCliente: usuario?.nombre || '', apellidoCliente: usuario?.apellido || '',
    email: usuario?.email || '', telefono: usuario?.telefono || '',
    direccion: usuario?.direccion || '', ciudad: '', provincia: '', codigoPostal: '', referencia: '',
    metodoPago: 'Contra entrega', tarjetaNumero: '', tarjetaVence: '', tarjetaCvv: '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Deteccion de marca de la tarjeta (en vivo).
  const marcaT = detectarMarca(form.tarjetaNumero);
  const digitosTar = form.tarjetaNumero.replace(/\D/g, '');
  const numCompleto = marcaT && digitosTar.length === marcaT.largo;

  // Totales: cupon, ITBIS 18%, envio (RD$200 en DN/SD; fuera se cotiza aparte)
  const descuento = cupon ? (cupon.tipo === 'porcentaje' ? subtotal * cupon.valor / 100 : Math.min(cupon.valor, subtotal)) : 0;
  const provinciaDN = ['distrito nacional', 'santo domingo'].includes((form.provincia || '').trim().toLowerCase());
  const envio = provinciaDN ? 200 : 0;
  const cotizarEnvio = form.provincia && !provinciaDN;
  const baseGravable = subtotal - descuento;
  const itbis = Math.round(baseGravable * 0.18 * 100) / 100;
  const totalFinal = baseGravable + itbis + envio;
  const aplicarCupon = async () => {
    setCuponMsg(null);
    if (!cuponInput.trim()) return;
    try {
      const c = await validarCupon(cuponInput.trim());
      setCupon(c); setCuponMsg({ ok: true, texto: `Cupon "${c.codigo}" aplicado` });
    } catch (e) { setCupon(null); setCuponMsg({ ok: false, texto: 'Cupon invalido o expirado' }); }
  };

  const pasos = ['Datos', 'Envio', 'Pago', 'Resumen'];
  const validar = () => {
    if (paso === 1) return form.nombreCliente && form.apellidoCliente && form.email && form.telefono;
    if (paso === 2) return form.direccion && form.ciudad && form.provincia;
    if (paso === 3) return form.metodoPago !== 'Tarjeta' || (numCompleto && form.tarjetaVence.length >= 4 && form.tarjetaCvv.length >= 3);
    return true;
  };
  const siguiente = () => { if (!validar()) { setError('Completa los campos requeridos.'); return; } setError(null); setPaso(p => Math.min(4, p + 1)); };
  const anterior  = () => { setError(null); setPaso(p => Math.max(1, p - 1)); };

  const confirmar = async () => {
    setEnviando(true); setError(null);
    const payload = {
      nombreCliente: form.nombreCliente, apellidoCliente: form.apellidoCliente, email: form.email, telefono: form.telefono,
      direccion: form.direccion, ciudad: form.ciudad, provincia: form.provincia, codigoPostal: form.codigoPostal, referencia: form.referencia,
      metodoPago: form.metodoPago, cuponCodigo: cupon ? cupon.codigo : null, usuarioId: usuario?.id || null,
      items: items.map(i => ({ relojId: i.relojId, movimientoId: i.movimientoId, tipoPulseraId: i.tipoPulseraId, cantidad: i.cantidad })),
    };
    const { ok, data } = await crearPedido(payload);
    setEnviando(false);
    if (ok) onConfirmado(data);
    else setError(data.mensaje || 'No se pudo crear el pedido');
  };

  const inp = { width: '100%', padding: '11px 13px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--sans)', boxSizing: 'border-box', outline: 'none', background: 'var(--white)' };
  const lbl = { display: 'block', fontSize: 8.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 };
  const field = (label, node) => <div style={{ marginBottom: 14 }}><label style={lbl}>{label}</label>{node}</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      {/* Barra superior */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem size={30} fg="var(--gold)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Finalizar compra</div>
        </div>
        <button onClick={onVolver} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>← Volver al carrito</button>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '90px 24px', color: 'var(--ink-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.5 }}><Emblem size={48} fg="var(--border-dk)" /></div>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Tu carrito esta vacio.</p>
          <button onClick={onVolver} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '12px 28px', cursor: 'pointer' }}>Volver</button>
        </div>
      ) : (
        <div className="col2" style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Columna izquierda: pasos */}
          <div>
            {/* Stepper */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {pasos.map((p, i) => {
                const n = i + 1, activo = paso === n, hecho = paso > n;
                return (
                  <div key={p} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 3, borderRadius: 2, background: (activo || hecho) ? 'var(--gold)' : 'var(--border)', marginBottom: 8 }} />
                    <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: (activo || hecho) ? 'var(--ink)' : 'var(--ink-4)' }}>{n}. {p}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 30px' }}>
              {error && <div style={{ padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 12, background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>}

              {/* Paso 1: datos personales */}
              {paso === 1 && (<>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>Datos personales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {field('Nombre', <input value={form.nombreCliente} onChange={e => set('nombreCliente', e.target.value)} placeholder="Carlos" style={inp} />)}
                  {field('Apellido', <input value={form.apellidoCliente} onChange={e => set('apellidoCliente', e.target.value)} placeholder="Martinez" style={inp} />)}
                </div>
                {field('Correo electronico', <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@email.com" style={inp} />)}
                {field('Telefono', <input value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="809-555-0101" style={inp} />)}
              </>)}

              {/* Paso 2: envio */}
              {paso === 2 && (<>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>Direccion de envio</h3>
                {field('Direccion', <input value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Av. Winston Churchill 45" style={inp} />)}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {field('Ciudad', <input value={form.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Santo Domingo" style={inp} />)}
                  {field('Provincia', <select value={form.provincia} onChange={e => set('provincia', e.target.value)} required style={inp}>
                    <option value="">Selecciona</option>
                    <option>Distrito Nacional</option>
                    <option>Santo Domingo</option>
                    <option>Santiago</option>
                    <option>La Vega</option>
                    <option>Puerto Plata</option>
                    <option>San Cristobal</option>
                    <option>La Altagracia</option>
                    <option>San Pedro de Macoris</option>
                    <option>Otra</option>
                  </select>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  {field('Codigo postal', <input value={form.codigoPostal} onChange={e => set('codigoPostal', e.target.value)} placeholder="10101" style={inp} />)}
                  {field('Referencia (opcional)', <input value={form.referencia} onChange={e => set('referencia', e.target.value)} placeholder="Casa azul, porton negro" style={inp} />)}
                </div>
              </>)}

              {/* Paso 3: pago */}
              {paso === 3 && (<>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>Metodo de pago</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
                  {['Contra entrega', 'Transferencia', 'Tarjeta'].map(m => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 6, cursor: 'pointer', background: form.metodoPago === m ? 'var(--gold-bg)' : 'var(--white)', border: `1px solid ${form.metodoPago === m ? 'var(--gold-lt)' : 'var(--border)'}` }}>
                      <input type="radio" name="pago" checked={form.metodoPago === m} onChange={() => set('metodoPago', m)} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{m}</span>
                    </label>
                  ))}
                </div>
                {form.metodoPago === 'Tarjeta' && (
                  <div style={{ marginTop: 14 }}>
                    <label style={lbl}>Numero de tarjeta</label>
                    <div style={{ position: 'relative', marginBottom: 6 }}>
                      <input value={form.tarjetaNumero} onChange={e => set('tarjetaNumero', formatearTarjeta(e.target.value))} placeholder="0000 0000 0000 0000" style={{ ...inp, paddingRight: 92, fontFamily: 'var(--mono)', letterSpacing: '0.08em' }} />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                        {marcaT
                          ? <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--white)', background: marcaT.color, padding: '4px 8px', borderRadius: 4 }}>{marcaT.marca}</span>
                          : null}
                      </span>
                    </div>
                    {form.tarjetaNumero && (
                      <div style={{ fontSize: 10, marginBottom: 12, letterSpacing: '0.06em', color: numCompleto ? 'var(--gold)' : 'var(--ink-4)' }}>
                        {numCompleto ? 'Numero completo' : `Faltan digitos (${digitosTar.length}/${marcaT ? marcaT.largo : 16})`}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {field('Vence (MM/AA)', <input value={form.tarjetaVence} onChange={e => set('tarjetaVence', formatearVence(e.target.value))} placeholder="MM/AA" maxLength={5} style={inp} />)}
                      {field(`CVV (${marcaT ? marcaT.cvv : 3} dig.)`, <input value={form.tarjetaCvv} onChange={e => set('tarjetaCvv', e.target.value.replace(/\D/g, '').slice(0, marcaT ? marcaT.cvv : 4))} placeholder={marcaT && marcaT.cvv === 4 ? '1234' : '123'} style={inp} />)}
                    </div>
                  </div>
                )}
              </>)}

              {/* Paso 4: resumen */}
              {paso === 4 && (<>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 18 }}>Revisa y confirma</h3>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.9 }}>
                  <div><strong style={{ color: 'var(--ink)' }}>{form.nombreCliente} {form.apellidoCliente}</strong> · {form.email} · {form.telefono}</div>
                  <div>{form.direccion}, {form.ciudad}, {form.provincia} {form.codigoPostal}</div>
                  {form.referencia && <div style={{ color: 'var(--ink-4)' }}>Ref: {form.referencia}</div>}
                  <div style={{ marginTop: 6 }}>Pago: <strong style={{ color: 'var(--ink)' }}>{form.metodoPago}</strong></div>
                </div>
              </>)}

              {/* Navegacion de pasos */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                {paso > 1 && <button onClick={anterior} style={{ flex: 1, padding: '12px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--border-dk)', borderRadius: 3, cursor: 'pointer' }}>Atras</button>}
                {paso < 4
                  ? <button onClick={siguiente} style={{ flex: 2, padding: '12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Continuar</button>
                  : <button onClick={confirmar} disabled={enviando} style={{ flex: 2, padding: '12px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: enviando ? 'var(--ink-3)' : 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: enviando ? 'not-allowed' : 'pointer' }}>{enviando ? 'Procesando...' : 'Confirmar pedido'}</button>}
              </div>
            </div>
          </div>

          {/* Columna derecha: resumen del pedido */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 26px', position: 'sticky', top: 90 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16 }}>Tu pedido ({unidades} pza)</div>
            {items.map(i => (
              <div key={i.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{i.relojNombre}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{i.maquina} · {i.pulsera} · x{i.cantidad}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>RD$ {(i.precio * i.cantidad).toLocaleString('es-DO')}</div>
              </div>
            ))}
            {/* Cupon */}
            <div style={{ display: 'flex', gap: 8, margin: '16px 0 6px' }}>
              <input value={cuponInput} onChange={e => setCuponInput(e.target.value)} placeholder="Cupon de descuento" style={{ flex: 1, padding: '9px 11px', border: '1px solid var(--border-dk)', borderRadius: 4, fontSize: 12, fontFamily: 'var(--mono)', textTransform: 'uppercase', outline: 'none' }} />
              <button type="button" onClick={aplicarCupon} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '0 14px', cursor: 'pointer' }}>Aplicar</button>
            </div>
            {cuponMsg && <div style={{ fontSize: 10, marginBottom: 8, color: cuponMsg.ok ? '#2D6A4F' : 'var(--rose)' }}>{cuponMsg.texto}</div>}

            {/* Desglose */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 6, fontSize: 12.5, color: 'var(--ink-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>Subtotal</span><span style={{ fontFamily: 'var(--mono)' }}>RD$ {subtotal.toLocaleString('es-DO')}</span></div>
              {descuento > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#2D6A4F' }}><span>Descuento ({cupon.codigo})</span><span style={{ fontFamily: 'var(--mono)' }}>− RD$ {descuento.toLocaleString('es-DO')}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>ITBIS (18%)</span><span style={{ fontFamily: 'var(--mono)' }}>RD$ {itbis.toLocaleString('es-DO')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}><span>Envio</span><span style={{ fontFamily: 'var(--mono)' }}>{cotizarEnvio ? 'A cotizar' : `RD$ ${envio.toLocaleString('es-DO')}`}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>RD$ {totalFinal.toLocaleString('es-DO')}</span>
            </div>
            {cotizarEnvio && <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 6 }}>* El envio fuera del Distrito Nacional / Santo Domingo se cotiza aparte.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
