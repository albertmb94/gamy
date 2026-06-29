import { Spade, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useRemigioStore } from '../store/useRemigioStore';
import { RemigioList } from './screens/RemigioList';
import { RemigioNew } from './screens/RemigioNew';
import { RemigioSession } from './screens/RemigioSession';
import { RemigioSettings } from './screens/RemigioSettings';

export function RemigioModule() {
  const { open, screen, activeSessionId, closeModule, goSettings } = useRemigioStore();
  if (!open) return null;

  const showSettingsButton = screen === 'list' || screen === 'new';

  const titleByScreen: Record<typeof screen, string> = {
    list: 'Remigio',
    new: 'Nueva partida',
    session: 'Partida',
    settings: 'Ajustes',
  };

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <header className="sticky top-0 z-10 px-4 pt-3 pb-2.5 flex items-center justify-between">
        <button
          onClick={closeModule}
          className="w-9 h-9 rounded-full bg-card border border-border text-foreground flex items-center justify-center"
          title="Volver a la Ludoteca"
          aria-label="Cerrar módulo de Remigio"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
        <div className="text-center leading-tight">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-center gap-1">
            <Spade className="h-3 w-3" /> Remigio
          </p>
          <h1 className="text-base font-bold tracking-tight text-foreground">{titleByScreen[screen]}</h1>
        </div>
        {showSettingsButton ? (
          <button
            onClick={goSettings}
            className="w-9 h-9 rounded-full bg-card border border-border text-foreground flex items-center justify-center"
            title="Ajustes"
            aria-label="Abrir ajustes"
          >
            <SettingsIcon className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
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