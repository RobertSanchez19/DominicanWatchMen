import React from 'react';

// Hook de ruteo por hash: escucha el evento 'hashchange' del navegador y
// devuelve la ruta actual, para tener varias "paginas" sin recargar.
export function useHashRoute() {
  const [hash, setHash] = React.useState(window.location.hash || '#/');
  React.useEffect(() => {
    const fn = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', fn);
    return () => window.removeEventListener('hashchange', fn);
  }, []);
  return hash;
}

// Cambia la ruta (dispara el hashchange que escucha useHashRoute).
export function irARuta(r) { window.location.hash = r; }
