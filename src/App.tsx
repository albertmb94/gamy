import { useEffect, useMemo } from 'react';
import { Library as LibraryIcon, Dices, ScrollText, BarChart3, Users, Gamepad2, ChevronDown, ListMusic } from 'lucide-react';
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
  const { currentTab, setTab, loadFromLocalDb, matches, games, players } = useStore();
  const dbStatus = useStore((s) => s.dbStatus);
  const loadRemigio = useRemigioStore((s) => s.load);
  const syncRemigio = useRemigioStore((s) => s.syncAll);
  const remigioSessions = useRemigioStore((s) => s.sessions);
  const openRemigio = useRemigioStore((s) => s.openModule);

  useEffect(() => {
    loadFromLocalDb();
    loadRemigio();
  }, [loadFromLocalDb, loadRemigio]);

  useEffect(() => {
    if (dbStatus === 'connected') syncRemigio();
  }, [dbStatus, syncRemigio]);

  // "Now playing" — última partida registrada (la más reciente).
  const nowPlaying = useMemo(() => {
    if (matches.length === 0) return null;
    const last = [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    const game = games.find(g => g.id === last.gameId);
    if (!game) return null;
    const winner = players.find(p => p.id === last.winnerId);
    return { game, winner, match: last };
  }, [matches, games, players]);

  const activeRemigioCount = remigioSessions.filter(s => s.status !== 'finished').length;

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

      {/* Bottom bar: now-playing pill + nav pill, una sobre la otra */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-md space-y-2 mb-3">
          {nowPlaying && (
            <button
              onClick={() => setTab('history')}
              className="now-playing-bar w-full flex items-center gap-3 px-3 py-2 text-left transition-transform hover:scale-[1.01]"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary shrink-0">
                {nowPlaying.game.imageUrl ? (
                  <img src={nowPlaying.game.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-zinc-100 to-zinc-200">
                    🎲
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{nowPlaying.game.name}</p>
                <p className="text-[11px] text-primary-foreground/70 truncate">
                  {nowPlaying.winner ? `Última · Ganó ${nowPlaying.winner.name}` : 'Última partida'}
                </p>
              </div>
              <span className="w-8 h-8 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <ListMusic className="h-4 w-4" />
              </span>
            </button>
          )}

          {activeRemigioCount > 0 && (
            <button
              onClick={openRemigio}
              className="now-playing-bar w-full flex items-center gap-3 px-3 py-2 text-left transition-transform hover:scale-[1.01]"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-foreground/15 flex items-center justify-center shrink-0">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">Remigio en juego</p>
                <p className="text-[11px] text-primary-foreground/70 truncate">
                  {activeRemigioCount} partida{activeRemigioCount > 1 ? 's' : ''} activa{activeRemigioCount > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          )}

          <div className="bottom-nav mx-auto px-2 py-2">
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
        </div>
      </nav>

      <RemigioModule />
    </div>
  );
}