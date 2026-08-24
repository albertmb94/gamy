import { useEffect } from 'react';

/**
 * Bloquea el scroll del fondo (contenedor #root) mientras un modal está
 * abierto. Añade la clase `modal-open` a <body>; el CSS correspondiente
 * vive en index.css. Soporta varios modales anidados (p. ej. GameDetail
 * con GameForm encima): solo se libera el scroll cuando el último cierra.
 */
let lockCount = 0;

export function useModalLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    document.body.classList.add('modal-open');
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.classList.remove('modal-open');
      }
    };
  }, [active]);
}
