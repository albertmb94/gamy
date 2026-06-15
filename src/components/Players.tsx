import { useState } from 'react';
import { useStore } from '../store/useStore';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];

const ACHIEVEMENTS_MAP: Record<string, { name: string; icon: string; description: string }> = {
  racha_3: { name: 'Racha de 3', icon: '🔥', description: 'Ganar 3 partidas consecutivas' },
  club_100: { name: 'Club de los 100', icon: '💯', description: 'Superar 100 puntos en una partida' },
  pacificador: { name: 'El Pacificador', icon: '🕊️', description: 'Ganar 7 Wonders con 0 en militar' },
};

export default function Players() {
  const { players, matches, playerAchievements, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPlayer(newName.trim(), selectedColor);
    setNewName('');
    setSelectedColor(COLORS[(players.length + 1) % COLORS.length]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Jugadores</h2>
        <p className="text-sm text-[var(--text-secondary)]">{players.length} registrados</p>
      </div>

      <div className="glass-card p-4 space-y-4">
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del jugador"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="input-field flex-1" />
          <button onClick={handleAdd} className="btn btn-primary px-5">+</button>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => setSelectedColor(c)}
                className={`w-9 h-9 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {players.map(player => {
          const playerMatches = matches.filter(m => m.playerIds.includes(player.id));
          const wins = playerMatches.filter(m => m.winnerId === player.id).length;
          const pAchievements = playerAchievements.filter(a => a.playerId === player.id);
          const winRate = playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0;

          return (
            <div key={player.id} className="glass-card p-4 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg"
                  style={{ backgroundColor: player.color }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {editId === player.id ? (
                    <div className="flex gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="input-field flex-1 text-sm py-1.5"
                        autoFocus onKeyDown={e => { if (e.key === 'Enter') { updatePlayer(player.id, { name: editName }); setEditId(null); } }} />
                      <button onClick={() => { updatePlayer(player.id, { name: editName }); setEditId(null); }}
                        className="btn btn-success px-3 py-1.5">✓</button>
                    </div>
                  ) : (
                    <h3 className="text-white font-bold truncate">{player.name}</h3>
                  )}
                  <div className="flex gap-3 text-xs text-[var(--text-secondary)] mt-1 font-medium">
                    <span>{playerMatches.length} partidas</span>
                    <span className="text-emerald-400">{wins} victorias</span>
                    <span>{winRate}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditId(player.id); setEditName(player.name); }}
                    className="text-[var(--text-muted)] hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">✏️</button>
                  <button onClick={() => { if (confirm(`¿Eliminar a ${player.name}?`)) deletePlayer(player.id); }}
                    className="text-[var(--text-muted)] hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition-colors text-sm">🗑️</button>
                </div>
              </div>

              {playerMatches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${winRate}%`, backgroundColor: player.color }} />
                  </div>
                </div>
              )}

              {pAchievements.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {pAchievements.map(a => {
                    const info = ACHIEVEMENTS_MAP[a.achievementId];
                    return info ? (
                      <span key={a.achievementId} className="text-xs bg-amber-500/15 text-amber-400 px-2 py-1 rounded-lg border border-amber-500/20" title={info.description}>
                        {info.icon} {info.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <div className="text-center py-16 glass-card">
          <p className="text-5xl mb-4">👤</p>
          <p className="text-[var(--text-secondary)] font-medium">Añade jugadores para empezar</p>
        </div>
      )}
    </div>
  );
}
