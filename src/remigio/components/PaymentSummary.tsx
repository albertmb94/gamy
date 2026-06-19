import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';
import { getSettlements, transactionLabel } from '../engine';

export function PaymentSummary({ session }: { session: RemigioSession }) {
  const settlements = getSettlements(session);
  const winner = session.players.find((p) => p.status === 'winner');

  return (
    <Card className="border-green-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Resumen Final
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {winner && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Ganador</p>
            <p className="text-2xl font-bold text-green-700">{winner.guest_name}</p>
            <p className="text-sm mt-1">
              {winner.current_score} puntos · {winner.total_rounds_won} rondas ganadas
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Jugador</th>
                <th className="text-right py-2 px-2">Pagado</th>
                <th className="text-right py-2 px-2">Recibido</th>
                <th className="text-right py-2 px-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item) => (
                <tr key={item.player.id} className="border-b last:border-0">
                  <td className="py-3 px-2 font-medium">{item.player.guest_name}</td>
                  <td className="text-right py-3 px-2 text-red-600 tabular-nums">-{item.paid.toFixed(2)}€</td>
                  <td className="text-right py-3 px-2 text-green-600 tabular-nums">+{item.received.toFixed(2)}€</td>
                  <td className="text-right py-3 px-2">
                    <span
                      className={cn(
                        'font-bold inline-flex items-center gap-1 tabular-nums',
                        item.balance > 0 && 'text-green-600',
                        item.balance < 0 && 'text-red-600',
                        item.balance === 0 && 'text-muted-foreground',
                      )}
                    >
                      {item.balance > 0 ? <TrendingUp className="h-3 w-3" /> : item.balance < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      {item.balance > 0 ? '+' : ''}
                      {item.balance.toFixed(2)}€
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Detalle de transacciones</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto text-sm">
            {session.transactions.map((t) => {
              const payer = session.players.find((p) => p.id === t.game_player_id);
              const recipient = session.players.find((p) => p.id === t.recipient_id);
              return (
                <div key={t.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                  <span className="text-muted-foreground">
                    {transactionLabel(t)}
                    {recipient && <span className="text-foreground"> → {recipient.guest_name}</span>}
                  </span>
                  <span className="font-medium tabular-nums">
                    {payer?.guest_name}: {t.amount.toFixed(2)}€
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
