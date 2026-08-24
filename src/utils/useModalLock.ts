import { useEffect } from 'react';

/**
 * Bloquea el scroll del fondo (contenedor #root) mientras un modal está
 * abierto. Añade la clase `modal-open` a <body>; el CSS correspondiente
 * vive en index.css. Soporta varios modales anidados: solo se libera el
 * scroll cuando el último cierra.
 */
export function useModalLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [active]);
}
