import { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Overlay de modal renderizado vía portal en <body>.
 *
 * Es CRÍTICO usar portal: los navegadores WebKit (iOS) rompen position:fixed
 * dentro de contenedores con scroll (-webkit-overflow-scrolling), transform o
 * filter, anclando el overlay al contenido en vez del viewport (el modal
 * "flota" por la página y sus botones quedan inalcanzables).
 *
 * `top` eleva el overlay por encima del módulo Remigio (z-80) para dialogs
 * de confirmación que puedan vivir dentro de él.
 */
export function ModalOverlay({
  children,
  onClick,
  top = false,
}: {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  top?: boolean;
}) {
  return createPortal(
    <div className={top ? 'modal-overlay modal-overlay-top' : 'modal-overlay'} onClick={onClick}>
      {children}
    </div>,
    document.body,
  );
}
