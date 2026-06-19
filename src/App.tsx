import { useEffect } from 'react';
import { Library as LibraryIcon, Dices, ScrollText, BarChart3, Users, Gamepad2 } from 'lucide-react';
import { useStore } from './store/useStore';
import { useRemigioStore } from './store/useRemigioStore';
import { cn } from './utils/cn';
import DbIndicator from './components/DbIndicator';
import Library from './components/Library';
import Players from './components/Players';
import PlaySession from './components/PlaySession';
import History from './components/History';
import Stats from './components/Stats';
import { RemigioModule } from './remigio/RemigioModule';

const TABS = [
  { key: 'library' as const, label: 'Ludoteca', icon: LibraryIcon },
  { key: 'play' as const, label: 'Jugar', icon: Dices },
  { key: 'history' as const, label: 'Historial', icon: ScrollText },
  { key: 'stats' as const, label: 'Stats', icon: BarChart3 },
  { key: 'players' as const, label: 'Jugadores', icon: Users },
];

export default function App() {
  const { currentTab, setTab, loadFromLocalDb, matches } = useStore();
  const dbStatus = useStore((s) => s.dbStatus);
  const loadRemigio = useRemigioStore((s) => s.load);
  const syncRemigio = useRemigioStore((s) => s.syncAll);

  useEffect(() => {
    loadFromLocalDb();
    loadRemigio();
  }, [loadFromLocalDb, loadRemigio]);

  // Cuando se (re)establece la conexión con Turso, sincroniza Remigio.
  useEffect(() => {
    if (dbStatus === 'connected') syncRemigio();
  }, [dbStatus, syncRemigio]);

  const tabContent = () => {
    switch (currentTab) {
      case 'library': return <Library />;
      case 'play': return <PlaySession />;
      case 'history': return <History />;
      case 'stats': return <Stats />;
      case 'players': return <Players />;
      default: return <Library />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <h1 className="text-base font-bold tracking-tight">Gamy</h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tu ludoteca</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
            {matches.length} partidas
          </span>
          <DbIndicator />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-5 pb-28 overflow-y-auto overflow-x-hidden">
        <div className="max-w-3xl mx-auto animate-fade-in">{tabContent()}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="glass-card-elevated mx-auto max-w-md mb-3 px-2 py-2">
          <div className="flex justify-around items-center">
            {TABS.map((tab) => {
              const active = currentTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 py-2 px-2 min-w-[3.5rem] rounded-lg transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                  <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
                  {active && <span className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Remigio (juego integrado, se abre desde la Ludoteca) */}
      <RemigioModule />
    </div>
  );
}
