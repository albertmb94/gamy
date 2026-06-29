import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../utils/cn';

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

  // Ordenar jugadores por victorias para una vista tipo "ranking"
  const sortedPlayers = [...players].sort((a, b) => {
    const aWins = matches.filter(m => m.winnerId === a.id).length;
    const bWins = matches.filter(m => m.winnerId === b.id).length;
    return bWins - aWins;
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Jugadores</h2>
        <p className="text-sm text-muted-foreground">{players.length} registrados</p>
      </div>

      {/* Add player — card estilo "Add to library" */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del jugador"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="input-field flex-1" />
          <button onClick={handleAdd} className="btn btn-primary px-5">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => setSelectedColor(c)}
                className={cn('w-9 h-9 rounded-full transition-all', selectedColor === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110' : 'opacity-60 hover:opacity-100')}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      </div>

      {/* Lista de jugadores — estilo track-list */}
      <div className="glass-card overflow-hidden divide-y divide-border">
        {sortedPlayers.map((player, idx) => {
          const playerMatches = matches.filter(m => m.playerIds.includes(player.id));
          const wins = playerMatches.filter(m => m.winnerId === player.id).length;
          const pAchievements = playerAchievements.filter(a => a.playerId === player.id);
          const winRate = playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0;

          return (
            <div key={player.id} className="flex items-center gap-3 p-3 animate-fade-in">
              <span className="text-xs font-bold text-muted-foreground w-6 text-center tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
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
                      className="btn btn-success px-3 py-1.5"><Check className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground truncate">{player.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {playerMatches.length} partidas · {wins} victorias · {winRate}%
                    </p>
                  </>
                )}
                {playerMatches.length > 0 && (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                    <div className="h-full rounded-full transition-all" style={{ width: `${winRate}%`, backgroundColor: player.color }} />
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                {pAchievements.slice(0, 2).map(a => {
                  const info = ACHIEVEMENTS_MAP[a.achievementId];
                  return info ? <span key={a.achievementId} className="text-base" title={info.name}>{info.icon}</span> : null;
                })}
              </div>
              <div className="flex gap-0.5 shrink-0">
                <button onClick={() => { setEditId(player.id); setEditName(player.name); }}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-secondary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => { if (confirm(`¿Eliminar a ${player.name}?`)) deletePlayer(player.id); }}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-full hover:bg-secondary transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <div className="text-center py-16 glass-card">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground font-medium">Añade jugadores para empezar</p>
        </div>
      )}
    </div>
  );
}