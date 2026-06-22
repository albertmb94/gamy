import { Trophy, Skull, RotateCcw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../utils/cn';
import { RemigioSession } from '../types';
import { getBalance, lastRound } from '../engine';

export function Scoreboard({ session }: { session: RemigioSession }) {
  const { players, transactions, target_score: targetScore, price_per_round: pricePerRound } = session;
  const last = lastRound(session);

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.status === 'winner') return -1;
    if (b.status === 'winner') return 1;
    if (a.status === 'eliminated' && b.status !== 'eliminated') return 1;
    if (b.status === 'eliminated' && a.status !== 'eliminated') return -1;
    return a.current_score - b.current_score;
  });

  function lastRoundResult(playerId: string): { won: boolean; amount: number } | null {
    if (!last) return null;

    let won = false;
    let amount = 0;
    const inRound = last.scores.some((s) => s.game_player_id === playerId);

    if (last.winner_id === playerId) {
      const losersCount = last.scores.filter((s) => s.game_player_id !== playerId).length;
      won = true;
      amount += losersCount * pricePerRound;
    } else if (inRound) {
      amount -= pricePerRound;
    } else if (session.status !== 'finished') {
      return null;
    }

    if (session.status === 'finished') {
      for (const tx of transactions) {
        if (tx.type === 'round_payment') continue;
        if (tx.recipient_id === playerId) amount += tx.amount;
        if (tx.game_player_id === playerId) amount -= tx.amount;
      }
    }

    return { won, amount };
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Marcador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedPlayers.map((player) => {
          const isOverTarget = player.current_score > targetScore;
          const isWinner = player.status === 'winner';
          const isEliminated = player.status === 'eliminated';
          const isReentered = player.reentry_count > 0;
          const progress = Math.min((player.current_score / targetScore) * 100, 100);
          const isDanger = progress >= 80 && !isEliminated && !isWinner;
          const balance = getBalance(session, player.id);
          const result = lastRoundResult(player.id);

          return (
            <div
              key={player.id}
              className={cn(
                'rounded-xl border p-3 sm:p-4 transition-colors',
                isWinner && 'bg-green-50 border-green-300',
                isEliminated && 'bg-red-50 border-red-200 opacity-70',
                isDanger && !isOverTarget && 'border-orange-300',
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0 w-5 flex justify-center">
                    {isWinner && <Trophy className="h-4 w-4 text-yellow-500" />}
                    {isEliminated && <Skull className="h-4 w-4 text-red-500" />}
                    {isReentered && !isEliminated && !isWinner && <RotateCcw className="h-4 w-4 text-orange-500" />}
                    {isDanger && !isReentered && !isOverTarget && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {!isWinner && !isEliminated && !isReentered && !isDanger && (
                      <div className="h-2 w-2 rounded-full bg-foreground/30" />
                    )}
                  </div>
                  <span className="font-semibold text-sm sm:text-base truncate">{player.guest_name}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {player.reentry_count > 0 && (
                    <span className="text-[10px] sm:text-xs text-orange-600 font-medium bg-orange-50 px-1.5 py-0.5 rounded">
                      {player.reentry_count} reeng.
                    </span>
                  )}
                  <div className="text-right">
                    <span
                      className={cn(
                        'text-2xl sm:text-3xl font-bold leading-none tabular-nums',
                        isWinner && 'text-green-700',
                        isEliminated && 'text-red-600',
                        isOverTarget && !isEliminated && !isWinner && 'text-orange-600',
                      )}
                    >
                      {player.current_score}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm font-normal ml-1">/{targetScore}</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden mb-2">
                <div
                  className={cn(
                    'h-2.5 rounded-full transition-all',
                    isWinner && 'bg-green-500',
                    isEliminated && 'bg-red-500',
                    isDanger && 'bg-orange-500',
                    !isWinner && !isEliminated && !isDanger && 'bg-foreground',
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {result && (
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5',
                        result.won ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600',
                      )}
                    >
                      {result.won ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {result.won ? '+' : '-'}
                      {result.amount.toFixed(2)}€
                    </span>
                  )}
                  {transactions.length > 0 && (
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full',
                        balance > 0 && 'bg-green-50 text-green-700',
                        balance < 0 && 'bg-red-50 text-red-600',
                        balance === 0 && 'text-muted-foreground',
                      )}
                    >
                      {balance > 0 ? '+' : ''}
                      {balance.toFixed(2)}€
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {isWinner
                    ? 'Ganador'
                    : isEliminated
                      ? 'Eliminado'
                      : isDanger
                        ? '¡Cuidado!'
                        : `${player.total_rounds_won} rondas ganadas`}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
