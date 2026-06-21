import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';
import { getRoundSummary, lastRound } from '../engine';

export function RoundPaymentSummary({ session }: { session: RemigioSession }) {
  const last = lastRound(session);
  if (!last) return null;

  const rows = getRoundSummary(session, last.round_number);
  const winner = session.players.find((p) => p.id === last.winner_id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Resumen Ronda {last.round_number}
          {winner && (
            <span className="text-muted-foreground font-normal text-sm">
              — Gana {winner.guest_name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Jugador</th>
                <th className="text-right py-2 px-2">Paga</th>
                <th className="text-right py-2 px-2">Recibe</th>
                <th className="text-right py-2 px-2">Resultado ronda</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.player.id} className="border-b last:border-0">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.player.guest_name}</span>
                      {item.player.id === last.winner_id && (
                        <Trophy className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="text-right py-3 px-2 tabular-nums">
                    {item.paid > 0 ? (
                      <span className="text-red-600 font-medium">
                        -{item.paid.toFixed(2)}€
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0€</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-2 tabular-nums">
                    {item.received > 0 ? (
                      <span className="text-green-600 font-medium">
                        +{item.received.toFixed(2)}€
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0€</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-2">
                    <span
                      className={cn(
                        'font-bold inline-flex items-center gap-1 justify-end tabular-nums',
                        item.net > 0 && 'text-green-600',
                        item.net < 0 && 'text-red-600',
                      )}
                    >
                      {item.net > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : item.net < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : null}
                      {item.net > 0 ? '+' : ''}
                      {item.net.toFixed(2)}€
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}