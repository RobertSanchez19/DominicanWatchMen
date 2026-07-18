import React from 'react';
import { useHashRoute, irARuta } from './hooks/useHashRoute.js';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Strip from './components/Strip.jsx';
import CollectionGrid from './components/CollectionGrid.jsx';
import Editorial from './components/Editorial.jsx';
import Specs from './components/Specs.jsx';
import Process from './components/Process.jsx';
import Testimonials from './components/Testimonials.jsx';
import FAQ from './components/FAQ.jsx';
import CTABanner from './components/CTABanner.jsx';
import CarritoPanel from './components/CarritoPanel.jsx';
import PanelCuenta from './components/PanelCuenta.jsx';
import Footer from './components/Footer.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmacionPage from './pages/ConfirmacionPage.jsx';
import GarantiaPage from './pages/GarantiaPage.jsx';
import RestablecerPage from './pages/RestablecerPage.jsx';
import PerfilPage from './pages/PerfilPage.jsx';
import SoportePage from './pages/SoportePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import FabricacionPage from './pages/FabricacionPage.jsx';

// Componente raiz: arma el landing, maneja el usuario y el ruteo por hash.
// (Faltan las paginas de perfil/admin/garantia/taller/soporte y las
//  secciones del landing, que van en los siguientes pasos.)
export default function App() {
  const [scrolled, setScrolled]         = React.useState(false);
  const [usuario, setUsuario]           = React.useState(null);
  const [carrito, setCarrito]           = React.useState([]);
  const [ultimoPedido, setUltimoPedido] = React.useState(null);
  const [refreshKey, setRefreshKey]     = React.useState(0);

  const hash = useHashRoute();
  const ruta = (hash || '#/').replace(/^#/, '') || '/';
  const productoId = ruta.startsWith('/producto/') ? parseInt(ruta.split('/')[2]) : null;

  // Detecta el scroll para que el header se vuelva compacto.
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Agrega un item al carrito (o suma cantidad si ya existe la misma combinacion).
  const agregarAlCarrito = (item) => {
    const key = `${item.relojId}-${item.movimientoId}-${item.tipoPulseraId}`;
    setCarrito(prev => {
      const existe = prev.find(i => i.key === key);
      if (existe) return prev.map(i => i.key === key ? { ...i, cantidad: Math.min(i.max, i.cantidad + item.cantidad) } : i);
      return [...prev, { ...item, key }];
    });
    irARuta('/carrito');
  };
  const quitarDelCarrito = (key) => setCarrito(prev => prev.filter(i => i.key !== key));
  const vaciarCarrito = () => setCarrito([]);

  const carritoCount = carrito.reduce((s, i) => s + i.cantidad, 0);

  // Checkout (pantalla completa)
  if (ruta === '/checkout') {
    return (
      <CheckoutPage
        items={carrito}
        usuario={usuario}
        onVolver={() => irARuta('/carrito')}
        onConfirmado={(pedido) => { setUltimoPedido(pedido); setCarrito([]); irARuta('/confirmacion'); }}
      />
    );
  }
  if (ruta === '/confirmacion') {
    return <ConfirmacionPage pedido={ultimoPedido} onVolver={() => irARuta('/')} />;
  }
  if (ruta === '/garantia') {
    return <GarantiaPage onVolver={() => irARuta('/')} />;
  }
  if (ruta.startsWith('/restablecer/')) {
    return <RestablecerPage token={ruta.split('/')[2]} onListo={() => irARuta('/cuenta')} />;
  }
  if (ruta === '/perfil' && usuario) {
    return (
      <PerfilPage
        usuario={usuario}
        onActualizar={(u) => setUsuario(u)}
        onVolver={() => irARuta('/')}
        onLogout={() => { setUsuario(null); irARuta('/'); }}
      />
    );
  }
  if (ruta === '/soporte' && usuario && (usuario.rol === 'Soporte' || usuario.rol === 'Admin')) {
    return <SoportePage usuario={usuario} onVolver={() => irARuta('/')} />;
  }
  if (ruta === '/admin' && usuario?.esAdmin) {
    return <AdminPage usuario={usuario} onVolver={() => irARuta('/')} onCambio={() => setRefreshKey(k => k + 1)} />;
  }
  if (ruta === '/fabricacion' && usuario && (usuario.rol === 'Fabricante' || usuario.rol === 'Admin')) {
    return <FabricacionPage usuario={usuario} onVolver={() => irARuta('/')} />;
  }

  // Vista principal (tienda)
  return (
    <>
      <Nav
        scrolled={scrolled}
        usuario={usuario}
        onOpenCuenta={() => irARuta(usuario ? '/perfil' : '/cuenta')}
        onOpenAdmin={() => irARuta('/admin')}
        onNavigate={irARuta}
        carritoCount={carritoCount}
        onOpenCarrito={() => irARuta('/carrito')}
      />
      <Hero />
      <Strip />
      <CollectionGrid
        refreshKey={refreshKey}
        usuario={usuario}
        productoId={productoId}
        onAbrir={(id) => irARuta('/producto/' + id)}
        onCerrarDetalle={() => irARuta('/')}
        onAgregar={agregarAlCarrito}
      />
      <Editorial />
      <Specs />
      <Process />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
      <CarritoPanel
        open={ruta === '/carrito'}
        items={carrito}
        onClose={() => irARuta('/')}
        onQuitar={quitarDelCarrito}
        onVaciar={vaciarCarrito}
        onCheckout={() => irARuta('/checkout')}
      />
      <PanelCuenta
        open={ruta === '/cuenta'}
        usuario={usuario}
        onClose={() => irARuta('/')}
        onLogin={(u) => { setUsuario(u); irARuta('/'); }}
        onLogout={() => { setUsuario(null); irARuta('/'); }}
        onRelojCreado={() => setRefreshKey(k => k + 1)}
      />
    </>
  );
}
