import React from 'react';
import Emblem from '../components/Emblem.jsx';

// Pagina adicional: politica de garantia + preguntas frecuentes (acordeon).
export default function GarantiaPage({ onVolver }) {
  const [open, setOpen] = React.useState(null);

  const cobertura = [
    { item: 'Maquina / movimiento', ok: true },
    { item: 'Ensamblaje y mano de obra (servicio)', ok: true },
    { item: 'Esfera, agujas y marcadores', ok: true },
    { item: 'Cristal y corona', ok: false },
    { item: 'Pulsera / correa', ok: false },
    { item: 'Bateria (modelos de cuarzo)', ok: false },
    { item: 'Golpes, agua fuera de rango, uso indebido o desgaste normal', ok: false },
    { item: 'Manipulacion por terceros no autorizados', ok: false },
  ];
  const pasos = [
    ['01', 'Contactanos', 'Escribenos por WhatsApp o correo con tu numero de pedido y una descripcion del problema.'],
    ['02', 'Evaluacion', 'Envia la pieza a nuestro taller. Un tecnico la revisa y confirma si aplica la garantia (3 a 7 dias habiles).'],
    ['03', 'Reparacion o reemplazo', 'Reparamos sin costo la pieza o el servicio cubierto. Si no es reparable, la reemplazamos por un modelo igual o de valor equivalente.'],
  ];
  const faqs = [
    { q: '¿Que cubre la garantia?', a: 'Un (1) año completo desde la fecha de compra, en piezas y servicios (mano de obra), contra defectos de fabricacion del movimiento, la esfera, las agujas, los marcadores y el ensamblaje.' },
    { q: '¿Que NO cubre?', a: 'Cristal, corona, pulsera/correa y bateria; ni danos por golpes, accidentes, agua fuera de la resistencia indicada, uso indebido, desgaste normal o manipulacion por terceros no autorizados.' },
    { q: '¿Necesito la factura o comprobante?', a: 'Si. Necesitas el comprobante de compra o tu numero de pedido para validar la garantia.' },
    { q: '¿Cuanto tarda el servicio?', a: 'La evaluacion toma de 3 a 7 dias habiles; la reparacion depende de la pieza, normalmente entre 1 y 3 semanas.' },
    { q: '¿La garantia cubre el agua?', a: 'Solo si el dano ocurre dentro de la resistencia al agua indicada del modelo y sin manipular la corona bajo el agua. El ingreso de agua por mal uso no esta cubierto.' },
    { q: '¿Puedo personalizar el reloj y mantener la garantia?', a: 'Si, siempre que el trabajo lo realice nuestro taller. Modificaciones por terceros no autorizados anulan la garantia.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 48px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Emblem size={30} fg="var(--gold)" />
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Garantia y Preguntas</div>
        </div>
        <button onClick={onVolver} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-dk)', borderRadius: 3, padding: '8px 18px', cursor: 'pointer' }}>← Volver a la tienda</button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 48px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 28, height: 1, background: 'var(--gold)', display: 'block' }} />
          <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--gold)' }}>Respaldo DWM</span>
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(38px,4.5vw,60px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.05, marginBottom: 12 }}>
          Garantia de <em style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--gold)' }}>1 año</em>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.8, maxWidth: 620, marginBottom: 40 }}>
          Cada pieza Dominican Watch Men esta cubierta por una <strong style={{ color: 'var(--ink)' }}>garantia limitada de un (1) año en piezas y servicios</strong>, a partir de la fecha de compra, contra todo defecto de fabricacion. Respaldamos tanto los componentes como la mano de obra de nuestro ensamblaje.
        </p>

        <div className="col2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 44, background: 'var(--white)' }}>
          <div style={{ padding: '26px 28px', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>Incluido en la garantia</div>
            <div style={{ width: 26, height: 1, background: 'var(--gold)', margin: '10px 0 18px' }} />
            {cobertura.filter(c => c.ok).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '11px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 16, height: 1, background: 'var(--gold)', marginTop: 11, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.35 }}>{c.item}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '26px 28px', background: 'var(--off-white)' }}>
            <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 4 }}>No incluido</div>
            <div style={{ width: 26, height: 1, background: 'var(--border-dk)', margin: '10px 0 18px' }} />
            {cobertura.filter(c => !c.ok).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '11px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 16, height: 1, background: 'var(--border-dk)', marginTop: 11, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.35 }}>{c.item}</span>
              </div>
            ))}
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 20 }}>Como reclamar tu garantia</h2>
        <div className="col3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 44 }}>
          {pasos.map(([n, t, d]) => (
            <div key={n} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '24px 22px' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 40, fontWeight: 600, color: 'rgba(168,134,44,0.28)', lineHeight: 1, marginBottom: 12 }}>{n}</div>
              <div style={{ width: 26, height: 1, background: 'var(--gold)', marginBottom: 14 }} />
              <h4 style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{t}</h4>
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.7 }}>{d}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 12 }}>Preguntas y respuestas</h2>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '4px 24px', marginBottom: 36 }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{f.q}</span>
                <span style={{ color: 'var(--gold)', fontSize: 20, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0, marginLeft: 16, fontWeight: 300 }}>+</span>
              </button>
              {open === i && <div style={{ padding: '0 0 18px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.8 }}>{f.a}</div>}
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--ink)', borderRadius: 12, padding: '28px 30px', color: 'var(--white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>¿Necesitas soporte?</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>Escribenos y con gusto activamos tu garantia.</div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 13, textAlign: 'right' }}>
            WhatsApp: <a href="https://wa.me/18094079575" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--white)', textDecoration: 'underline' }}>+1 809-407-9575</a><br />
            soporte@dominicanwatchmen.do
          </div>
        </div>
      </div>
    </div>
  );
}
