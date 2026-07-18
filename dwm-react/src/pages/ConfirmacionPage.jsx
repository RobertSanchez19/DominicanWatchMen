import Emblem from '../components/Emblem.jsx';

// Pagina de confirmacion: muestra el pedido creado con exito.
export default function ConfirmacionPage({ pedido, onVolver }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '48px 44px', maxWidth: 560, width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}>
        {!pedido ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 20 }}>No hay un pedido reciente para mostrar.</p>
            <button onClick={onVolver} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, padding: '12px 28px', cursor: 'pointer' }}>Ir a la tienda</button>
          </div>
        ) : (<>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}><Emblem size={52} fg="var(--gold)" flag={true} /></div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>¡Pedido confirmado!</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Gracias, {pedido.nombreCliente}. Tu pedido <strong style={{ color: 'var(--ink)' }}>#{pedido.id}</strong> fue registrado.</p>
          </div>

          <div style={{ background: 'var(--off-white)', borderRadius: 10, padding: '18px 20px', marginBottom: 20 }}>
            {pedido.items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', fontSize: 12.5, color: 'var(--ink-2)' }}>
                <span>{i.relojNombre} <span style={{ color: 'var(--ink-4)' }}>({i.maquinaNombre} · {i.pulseraNombre}) x{i.cantidad}</span></span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--ink)' }}>RD$ {i.subtotal.toLocaleString('es-DO')}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10, fontSize: 12, color: 'var(--ink-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>Subtotal</span><span style={{ fontFamily: 'var(--mono)' }}>RD$ {pedido.subtotal.toLocaleString('es-DO')}</span></div>
              {pedido.descuento > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#2D6A4F' }}><span>Descuento{pedido.cuponCodigo ? ` (${pedido.cuponCodigo})` : ''}</span><span style={{ fontFamily: 'var(--mono)' }}>− RD$ {pedido.descuento.toLocaleString('es-DO')}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>ITBIS (18%)</span><span style={{ fontFamily: 'var(--mono)' }}>RD$ {pedido.itbis.toLocaleString('es-DO')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}><span>Envio</span><span style={{ fontFamily: 'var(--mono)' }}>{pedido.envio > 0 ? `RD$ ${pedido.envio.toLocaleString('es-DO')}` : 'A cotizar'}</span></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Total</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>RD$ {pedido.total.toLocaleString('es-DO')}</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: 24 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 6 }}>Envio a</div>
            {pedido.direccion}, {pedido.ciudad}, {pedido.provincia} {pedido.codigoPostal}<br />
            Pago: {pedido.metodoPago} · Estado: {pedido.estado}
          </div>

          <button onClick={onVolver} style={{ width: '100%', padding: '13px', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--white)', border: 'none', borderRadius: 3, cursor: 'pointer' }}>Seguir comprando</button>
        </>)}
      </div>
    </div>
  );
}
