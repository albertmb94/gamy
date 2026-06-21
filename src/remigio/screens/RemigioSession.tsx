import { useState } from 'react';
import { ArrowLeft, Play, Pause, Trash2 } from 'lucide-react';
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

export function RemigioSession({ sessionId }: { sessionId: string }) {
  const { sessions, setStatus, remove, goList } = useRemigioStore();
  const session = sessions.find((s) => s.id === sessionId);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!session) {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={goList}>
          <ArrowLeft className="h-4 w-4" />
          Volver
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{session.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={isFinished ? 'outline' : isInProgress ? 'success' : 'secondary'}>{statusLabel(session.status)}</Badge>
              <span className="text-sm text-muted-foreground">
                {session.players.length} jugadores · Objetivo: {session.target_score} pts
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isWaiting && (
            <Button onClick={() => setStatus(session.id, 'in_progress')}>
              <Play className="h-4 w-4" />
              Iniciar Partida
            </Button>
          )}
          {isInProgress && (
            <Button variant="outline" onClick={() => setStatus(session.id, 'paused')}>
              <Pause className="h-4 w-4" />
              Pausar
            </Button>
          )}
          {isPaused && (
            <Button onClick={() => setStatus(session.id, 'in_progress')}>
              <Play className="h-4 w-4" />
              Reanudar
            </Button>
          )}
          {!isFinished && (
            <Button variant="destructive" size="icon" onClick={handleDelete} title="Cancelar partida">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isPaused && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-3">
            <p className="text-sm text-amber-800">Partida pausada. Reanúdala cuando quieras para seguir jugando.</p>
          </CardContent>
        </Card>
      )}

      <Scoreboard session={session} />

      {isInProgress && hasRounds && <RoundPaymentSummary session={session} />}

      {isInProgress && <RoundForm session={session} />}

      {hasRounds && <RoundHistory session={session} />}

      {isFinished && <PaymentSummary session={session} />}

      <Card className="bg-muted/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Configuración de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Por ronda:</span> <span className="font-medium">{session.price_per_round}€</span>
            </div>
            <div>
              <span className="text-muted-foreground">Por partida:</span> <span className="font-medium">{session.price_per_game}€</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reenganche:</span> <span className="font-medium">{session.price_per_reentry}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
