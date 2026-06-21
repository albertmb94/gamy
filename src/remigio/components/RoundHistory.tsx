import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';
import { useRemigioStore } from '../../store/useRemigioStore';
import { lastRound } from '../engine';

export function RoundHistory({ session }: { session: RemigioSession }) {
  const updateLastRound = useRemigioStore((s) => s.updateLastRound);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (session.rounds.length === 0) return null;

  const latestRound = lastRound(session);
  const canEdit = (roundId: string) => latestRound?.id === roundId && session.status !== 'finished';

  const startEditing = (round: RemigioSession['rounds'][number]) => {
    setEditingRoundId(round.id);
    setEditValues(
      round.scores.reduce((acc, score) => {
        acc[score.game_player_id] = String(score.points);
        return acc;
      }, {} as Record<string, string>),
    );
    setExpanded(round.id);
  };

  const cancelEditing = () => {
    setEditingRoundId(null);
    setEditValues({});
  };

  const submitEdit = (round: RemigioSession['rounds'][number]) => {
    const points = round.scores.map((score) => ({
      playerId: score.game_player_id,
      points: parseInt(editValues[score.game_player_id] ?? '0', 10) || 0,
    }));
    updateLastRound(session.id, points);
    setEditingRoundId(null);
    setEditValues({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Rondas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...session.rounds].reverse().map((round) => {
          const isOpen = expanded === round.id;
          const isEditing = editingRoundId === round.id;
          const winner = session.players.find((p) => p.id === round.winner_id);
          return (
            <div key={round.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : round.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">Ronda {round.round_number}</span>
                  {winner && <span className="text-sm text-green-600">Ganó: {winner.guest_name}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {canEdit(round.id) && !isEditing && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(round);
                      }}
                      className="inline-flex items-center justify-center text-xs font-medium text-primary hover:underline px-2 py-1 rounded"
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Editar
                    </span>
                  )}
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  {isEditing ? (
                    <div className="space-y-3 pt-1">
                      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {round.scores.map((score) => {
                          const player = session.players.find((p) => p.id === score.game_player_id);
                          return (
                            <div key={score.id} className="space-y-1">
                              <Label htmlFor={`edit-${round.id}-${score.game_player_id}`}>{player?.guest_name}</Label>
                              <Input
                                id={`edit-${round.id}-${score.game_player_id}`}
                                type="number"
                                inputMode="numeric"
                                min={0}
                                required
                                value={editValues[score.game_player_id] ?? ''}
                                onChange={(e) =>
                                  setEditValues((prev) => ({ ...prev, [score.game_player_id]: e.target.value }))
                                }
                                className="text-center font-semibold"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={cancelEditing}>
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                        <Button type="button" size="sm" onClick={() => submitEdit(round)}>
                          <Save className="h-4 w-4" />
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Jugador</th>
                          <th className="text-center py-2">Puntos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {round.scores.map((score) => {
                          const player = session.players.find((p) => p.id === score.game_player_id);
                          return (
                            <tr key={score.id} className={cn('border-b last:border-0', score.game_player_id === round.winner_id && 'bg-green-50')}>
                              <td className="py-2">{player?.guest_name}</td>
                              <td className="text-center py-2 font-medium tabular-nums">{score.points}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
