import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';

export function RoundHistory({ session }: { session: RemigioSession }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (session.rounds.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historial de Rondas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {[...session.rounds].reverse().map((round) => {
          const isOpen = expanded === round.id;
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
                {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
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
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
