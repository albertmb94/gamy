import { cn } from '../utils/cn';
import { Game } from '../types';

const GAME_EMOJIS: Record<string, string> = {
  'Estrategia': '♟️', 'Cartas': '🃏', 'Filler': '⚡', 'Cooperativo': '🤝',
  'Dados': '🎲', 'Puzzle': '🧩', 'Construcción': '🏗️', 'Negociación': '🤝',
  'Destreza': '🎯', 'Familiar': '👨‍👩‍👧‍👦', 'Abstracto': '🔷', 'Duel': '⚔️',
};

// Hash determinista del nombre para variar sutilmente la textura por juego.
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Portada generada para juegos sin imagen. Minimalista B&N, determinista por
 * nombre. `compact` para miniaturas (solo icono); `large` para cabeceras.
 */
export function GameCover({
  game,
  compact = false,
  large = false,
  className,
}: {
  game: Game;
  compact?: boolean;
  large?: boolean;
  className?: string;
}) {
  const type = game.types[0] || '';
  const emoji = GAME_EMOJIS[type] || '🎲';

  if (compact) {
    return (
      <div className={cn('w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200', className)}>
        <span className="text-xl">{emoji}</span>
      </div>
    );
  }

  const h = hashStr(game.name || 'x');
  const angle = 20 + (h % 90);
  const gap = 9 + (h % 7);

  return (
    <div className={cn('relative w-full h-full overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-200', className)}>
      {/* textura sutil determinista */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `repeating-linear-gradient(${angle}deg, rgba(0,0,0,0.04) 0 1px, transparent 1px ${gap}px)` }}
      />
      {/* marca de agua */}
      <span className={cn('absolute -right-4 -bottom-6 leading-none opacity-[0.07] select-none', large ? 'text-[10rem]' : 'text-[7rem]')}>{emoji}</span>
      {/* icono superior */}
      <span className={cn('absolute top-2.5 left-3', large ? 'text-4xl' : 'text-2xl')}>{emoji}</span>
      {/* texto */}
      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-0.5">
        {type && <span className={cn('uppercase tracking-[0.12em] text-zinc-500 font-bold', large ? 'text-[11px]' : 'text-[9px]')}>{type}</span>}
        <span className={cn('font-extrabold leading-tight text-zinc-900 line-clamp-2', large ? 'text-2xl' : 'text-sm')}>{game.name}</span>
      </div>
    </div>
  );
}
