import { X, Spade, Settings as SettingsIcon } from 'lucide-react';
import { useRemigioStore } from '../store/useRemigioStore';
import { RemigioList } from './screens/RemigioList';
import { RemigioNew } from './screens/RemigioNew';
import { RemigioSession } from './screens/RemigioSession';
import { RemigioSettings } from './screens/RemigioSettings';

export function RemigioModule() {
  const { open, screen, activeSessionId, closeModule, goSettings } = useRemigioStore();
  if (!open) return null;

  const showSettingsButton = screen === 'list' || screen === 'new';

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Spade className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <p className="font-bold text-base">Remigio</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Integrado en Ludotic</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {showSettingsButton && (
            <button
              onClick={goSettings}
              className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              title="Ajustes"
              aria-label="Abrir ajustes"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={closeModule}
            className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
            title="Volver a la Ludoteca"
            aria-label="Cerrar módulo de Remigio"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto animate-fade-in">
          {screen === 'list' && <RemigioList />}
          {screen === 'new' && <RemigioNew />}
          {screen === 'settings' && <RemigioSettings />}
          {screen === 'session' && activeSessionId && <RemigioSession sessionId={activeSessionId} />}
        </div>
      </main>
    </div>
  );
}