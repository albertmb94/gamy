import { useState } from 'react';
import { Send, LayoutGrid, Table } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';
import { useRemigioStore } from '../../store/useRemigioStore';

type ViewMode = 'cards' | 'table';

export function RoundForm({ session }: { session: RemigioSession }) {
  const addRound = useRemigioStore((s) => s.addRound);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [points, setPoints] = useState<Record<string, string>>({});

  const activePlayers = session.players.filter((p) => p.status === 'active');
  if (activePlayers.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roundPoints = activePlayers.map((p) => ({
      playerId: p.id,
      points: parseInt(points[p.id] ?? '', 10) || 0,
    }));
    addRound(session.id, roundPoints);
    setPoints({});
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Registrar Ronda {session.rounds.length + 1}</CardTitle>
            <CardDescription className="mt-1">
              Introduce los puntos de cada jugador. Gana quien menos puntos obtenga.
            </CardDescription>
          </div>
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn('p-2 rounded-md transition-colors', viewMode === 'cards' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}
              title="Vista tarjetas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn('p-2 rounded-md transition-colors', viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground')}
              title="Vista tabla"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {viewMode === 'cards' ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {activePlayers.map((player) => (
                <div key={player.id} className="space-y-1.5">
                  <Label htmlFor={`points-${player.id}`}>{player.guest_name}</Label>
                  <Input
                    id={`points-${player.id}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="0"
                    required
                    value={points[player.id] ?? ''}
                    onChange={(e) => setPoints((p) => ({ ...p, [player.id]: e.target.value }))}
                    className="text-lg font-semibold h-12 text-center"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-1 text-muted-foreground font-medium text-xs sticky left-0 bg-background z-10" />
                    {activePlayers.map((player) => (
                      <th key={player.id} className="text-center py-2 px-1 font-medium text-xs min-w-[60px]">
                        {player.guest_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-1 text-muted-foreground text-xs sticky left-0 bg-background z-10">Total</td>
                    {activePlayers.map((player) => (
                      <td
                        key={player.id}
                        className={cn('text-center py-2 px-1 font-bold tabular-nums', player.current_score > session.target_score && 'text-orange-600')}
                      >
                        {player.current_score}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-1 text-foreground font-semibold text-xs sticky left-0 bg-background z-10">
                      Ronda {session.rounds.length + 1}
                    </td>
                    {activePlayers.map((player) => (
                      <td key={player.id} className="py-1.5 px-1">
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          placeholder="0"
                          required
                          value={points[player.id] ?? ''}
                          onChange={(e) => setPoints((p) => ({ ...p, [player.id]: e.target.value }))}
                          className="text-center text-sm font-semibold h-9 px-1"
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg">
              <Send className="h-4 w-4" />
              Registrar Ronda
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
