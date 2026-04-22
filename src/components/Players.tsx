import { useState } from 'react';
import { useStore } from '../store/useStore';

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1'];

export default function Players() {
  const { players, matches, playerAchievements, addPlayer, updatePlayer, deletePlayer } = useStore();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const ACHIEVEMENTS_MAP: Record<string, { name: string; icon: string; description: string }> = {
    racha_3: { name: 'Racha de 3', icon: '🔥', description: 'Ganar 3 partidas consecutivas' },
    club_100: { name: 'Club de los 100', icon: '💯', description: 'Superar 100 puntos en una partida' },
    pacificador: { name: 'El Pacificador', icon: '🕊️', description: 'Ganar 7 Wonders con 0 en militar' },
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addPlayer(newName.trim(), selectedColor);
    setNewName('');
    setSelectedColor(COLORS[(players.length + 1) % COLORS.length]);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3">Añadir Jugador</h3>
        <div className="flex gap-2 mb-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm" />
          <button onClick={handleAdd} className="bg-purple-600 text-white rounded-xl px-5 py-3 font-bold hover:bg-purple-500 transition-colors">+</button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setSelectedColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${selectedColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' : 'opacity-60 hover:opacity-100'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {players.map(player => {
          const playerMatches = matches.filter(m => m.playerIds.includes(player.id));
          const wins = playerMatches.filter(m => m.winnerId === player.id).length;
          const pAchievements = playerAchievements.filter(a => a.playerId === player.id);

          return (
            <div key={player.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: player.color }}>
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {editId === player.id ? (
                    <div className="flex gap-2">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus onKeyDown={e => { if (e.key === 'Enter') { updatePlayer(player.id, { name: editName }); setEditId(null); } }} />
                      <button onClick={() => { updatePlayer(player.id, { name: editName }); setEditId(null); }}
                        className="text-green-400 text-sm">✓</button>
                    </div>
                  ) : (
                    <h3 className="text-white font-semibold truncate">{player.name}</h3>
                  )}
                  <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                    <span>{playerMatches.length} partidas</span>
                    <span>{wins} victorias</span>
                    <span>{playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditId(player.id); setEditName(player.name); }}
                    className="text-gray-400 hover:text-white p-1.5 text-sm">✏️</button>
                  <button onClick={() => { if (confirm(`¿Eliminar a ${player.name}?`)) deletePlayer(player.id); }}
                    className="text-gray-400 hover:text-red-400 p-1.5 text-sm">🗑️</button>
                </div>
              </div>

              {pAchievements.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {pAchievements.map(a => {
                    const info = ACHIEVEMENTS_MAP[a.achievementId];
                    return info ? (
                      <span key={a.achievementId} className="text-xs bg-amber-900/30 text-amber-400 px-2 py-1 rounded-lg" title={info.description}>
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
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-sm">Añade jugadores para empezar</p>
        </div>
      )}
    </div>
  );
}
