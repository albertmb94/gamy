import { useEffect } from 'react';
import { Library as LibraryIcon, Dices, ScrollText, BarChart3, Users, ChevronDown } from 'lucide-react';
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
  const { currentTab, setTab, loadFromLocalDb } = useStore();
  const dbStatus = useStore((s) => s.dbStatus);
  const loadRemigio = useRemigioStore((s) => s.load);
  const syncRemigio = useRemigioStore((s) => s.syncAll);

  useEffect(() => {
    loadFromLocalDb();
    loadRemigio();
  }, [loadFromLocalDb, loadRemigio]);

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
      {/* Header — estilo "Now Playing" del reproductor */}
      <header className="sticky top-0 z-40 px-4 pt-3 pb-2.5 flex items-center justify-between">
        <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground/70 hover:text-foreground transition-colors">
          <ChevronDown className="h-5 w-5" />
        </button>
        <div className="text-center leading-tight">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Ludotic</p>
          <h1 className="text-base font-bold tracking-tight text-foreground capitalize">
            {TABS.find(t => t.key === currentTab)?.label}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <DbIndicator />
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="max-w-3xl mx-auto animate-fade-in">{tabContent()}</div>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="bottom-nav mx-auto max-w-md mb-3 px-2 py-2">
          <div className="flex justify-around items-center">
            {TABS.map((tab) => {
              const active = currentTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={cn(
                    'relative flex flex-col items-center gap-1 py-2 px-2 min-w-[3.5rem] rounded-xl transition-colors',
                    active ? 'text-primary-foreground' : 'text-primary-foreground/55 hover:text-primary-foreground',
                  )}
                >
                  <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                  <span className="text-[10px] font-semibold leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <RemigioModule />
    </div>
  );
}