import { useState } from 'react';
import { Play, Pause, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useRemigioStore } from '../../store/useRemigioStore';
import { statusLabel } from '../engine';
import { Scoreboard } from '../components/Scoreboard';
import { RoundForm } from '../components/RoundForm';
import { RoundHistory } from '../components/RoundHistory';
import { RoundPaymentSummary } from '../components/RoundPaymentSummary';
import { PaymentSummary } from '../components/PaymentSummary';
import { cn } from '../../utils/cn';

export function RemigioSession({ sessionId }: { sessionId: string }) {
  const { sessions, setStatus, remove, goList } = useRemigioStore();
  const session = sessions.find((s) => s.id === sessionId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Button variant="ghost" size="icon" onClick={goList} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">La partida no existe.</CardContent>
        </Card>
      </div>
    );
  }

  const hasRounds = session.rounds.length > 0;
  const isWaiting = session.status === 'waiting' && !hasRounds;
  const isInProgress = session.status === 'in_progress';
  const isPaused = session.status === 'paused' || (session.status === 'waiting' && hasRounds);
  const isFinished = session.status === 'finished';

  const handleDelete = () => setConfirmDelete(true);
  const confirmDeleteNow = () => {
    remove(session.id);
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={goList} className="rounded-full shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-tight truncate">{session.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                isFinished ? 'bg-secondary text-muted-foreground' : isInProgress ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              )}>
                {statusLabel(session.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {session.players.length} jugadores · Objetivo {session.target_score}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isWaiting && (
            <Button onClick={() => setStatus(session.id, 'in_progress')} className="rounded-full">
              <Play className="h-4 w-4" />
              Iniciar
            </Button>
          )}
          {isInProgress && (
            <Button variant="outline" onClick={() => setStatus(session.id, 'paused')} className="rounded-full">
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          )}
          {isPaused && (
            <Button onClick={() => setStatus(session.id, 'in_progress')} className="rounded-full">
              <Play className="h-4 w-4" />
              Reanudar
            </Button>
          )}
          {!isFinished && (
            <Button variant="outline" size="icon" onClick={handleDelete} className="rounded-full" title="Cancelar partida">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isPaused && (
        <div className="glass-card p-3 border-amber-200">
          <p className="text-sm text-amber-700 font-medium">Partida pausada. Reanúdala cuando quieras para seguir jugando.</p>
        </div>
      )}

      <Scoreboard session={session} />

      {isInProgress && hasRounds && <RoundPaymentSummary session={session} />}

      {isInProgress && <RoundForm session={session} />}

      {hasRounds && <RoundHistory session={session} />}

      {isFinished && <PaymentSummary session={session} />}

      <div className="glass-card overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configuración de pagos</h3>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="text-center py-3">
            <p className="text-[10px] text-muted-foreground">Por ronda</p>
            <p className="text-sm font-bold tabular-nums">{session.price_per_round}€</p>
          </div>
          <div className="text-center py-3">
            <p className="text-[10px] text-muted-foreground">Por partida</p>
            <p className="text-sm font-bold tabular-nums">{session.price_per_game}€</p>
          </div>
          <div className="text-center py-3">
            <p className="text-[10px] text-muted-foreground">Reenganche</p>
            <p className="text-sm font-bold tabular-nums">{session.price_per_reentry}€</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Cancelar partida"
        description="¿Estás seguro de que quieres cancelar y eliminar esta partida? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar partida"
        cancelText="No, volver"
        destructive
        onConfirm={confirmDeleteNow}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}