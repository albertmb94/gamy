import { useEffect } from 'react';
import { useStore } from './store/useStore';
import DbIndicator from './components/DbIndicator';
import Library from './components/Library';
import Players from './components/Players';
import PlaySession from './components/PlaySession';
import History from './components/History';
import Stats from './components/Stats';

const TABS = [
  { key: 'library' as const, label: 'Ludoteca', icon: '📚' },
  { key: 'play' as const, label: 'Jugar', icon: '🎲' },
  { key: 'history' as const, label: 'Historial', icon: '📋' },
  { key: 'stats' as const, label: 'Stats', icon: '📊' },
  { key: 'players' as const, label: 'Jugadores', icon: '👤' },
];

export default function App() {
  const { currentTab, setTab, loadFromLocalDb, matches } = useStore();

  useEffect(() => {
    loadFromLocalDb();
  }, [loadFromLocalDb]);

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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="ambient-glow" />

      {/* Header */}
      <header className="relative z-40 glass-card border-b-0 border-b border-[var(--border)] rounded-none px-4 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <span className="font-black text-white text-lg tracking-tighter">G</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none tracking-tight text-white">Gamy</h1>
            <p className="text-[11px] text-[var(--text-muted)] leading-none mt-1">Tu ludoteca</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--text-secondary)] bg-slate-800/60 px-2.5 py-1 rounded-full border border-[var(--border)]">
            {matches.length} partidas
          </span>
          <DbIndicator />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 px-4 py-5 pb-28 overflow-y-auto overflow-x-hidden">
        <div className="max-w-3xl mx-auto animate-fade-in">
          {tabContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="glass-card mx-auto max-w-md mb-3 px-2 py-2">
          <div className="flex justify-around items-center">
            {TABS.map(tab => {
              const active = currentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setTab(tab.key)}
                  className={`relative flex flex-col items-center py-2 px-2 min-w-[3.5rem] rounded-xl transition-all ${
                    active ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-600/25 to-transparent rounded-xl" />
                  )}
                  <span className="text-lg leading-none mb-1 relative z-10">{tab.icon}</span>
                  <span className="text-[10px] font-semibold leading-none relative z-10">{tab.label}</span>
                  {active && (
                    <div className="absolute -bottom-0.5 w-5 h-1 rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
