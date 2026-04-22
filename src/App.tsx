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
  { key: 'play' as const, label: 'Jugar', icon: '🎮' },
  { key: 'history' as const, label: 'Historial', icon: '📋' },
  { key: 'stats' as const, label: 'Stats', icon: '📊' },
  { key: 'players' as const, label: 'Jugadores', icon: '👥' },
];

export default function App() {
  const { currentTab, setTab, initializeDefaults, matches } = useStore();

  useEffect(() => {
    initializeDefaults();
  }, [initializeDefaults]);

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-x-hidden" style={{ maxWidth: '100vw' }}>
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-black text-sm">
            G
          </div>
          <div>
            <h1 className="text-base font-bold leading-none tracking-tight">Gamy</h1>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5">Ludoteca</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{matches.length} partidas</span>
          <DbIndicator />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto overflow-x-hidden">
        {tabContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 px-2 pb-[env(safe-area-inset-bottom)] z-40">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setTab(tab.key)}
              className={`flex flex-col items-center py-2.5 px-3 min-w-0 transition-all ${
                currentTab === tab.key ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
              }`}>
              <span className="text-lg leading-none mb-0.5">{tab.icon}</span>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              {currentTab === tab.key && (
                <div className="w-1 h-1 rounded-full bg-purple-400 mt-1" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
