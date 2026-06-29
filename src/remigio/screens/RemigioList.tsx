import { useState } from 'react';
import { PlusCircle, Users, Trophy, Play, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useRemigioStore } from '../../store/useRemigioStore';
import { statusLabel } from '../engine';
import { RemigioSession } from '../types';
import { cn } from '../../utils/cn';

function SessionCard({ session, onOpen, onDelete }: { session: RemigioSession; onOpen: () => void; onDelete: () => void }) {
  const finished = session.status === 'finished';
  const paused = session.status === 'paused' || (session.status === 'waiting' && session.rounds.length > 0);
  return (
    <div className="glass-card overflow-hidden text-left animate-slide-up">
      <div className="flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{session.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {session.players.length} jugadores · {session.rounds.length} rondas · objetivo {session.target_score}
          </p>
        </div>
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shrink-0',
          finished ? 'bg-secondary text-muted-foreground' : paused ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
        )}>
          {statusLabel(session.status)}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2 px-4 pb-4">
        <Button variant="ghost" size="icon" onClick={onDelete} title="Eliminar">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button size="sm" variant={finished ? 'outline' : 'default'} onClick={onOpen} className="rounded-full">
          {finished ? 'Ver resumen' : paused ? (<><Play className="h-4 w-4" />Reanudar</>) : (<><Play className="h-4 w-4" />Ver</>)}
        </Button>
      </div>
    </div>
  );
}

export function RemigioList() {
  const { sessions, goNew, openSession, remove } = useRemigioStore();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const active = sessions.filter((s) => s.status !== 'finished');
  const finished = sessions.filter((s) => s.status === 'finished');

  const handleConfirmDelete = () => {
    if (pendingDeleteId) remove(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Partidas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Puntuaciones, rondas y pagos.</p>
        </div>
        <Button onClick={goNew} className="rounded-full">
          <PlusCircle className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Activas</h3>
          <div className="grid gap-3">
            {active.map((s) => (
              <SessionCard key={s.id} session={s} onOpen={() => openSession(s.id)} onDelete={() => setPendingDeleteId(s.id)} />
            ))}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Finalizadas</h3>
          <div className="grid gap-3">
            {finished.map((s) => (
              <SessionCard key={s.id} session={s} onOpen={() => openSession(s.id)} onDelete={() => setPendingDeleteId(s.id)} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-16 glass-card">
          <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-foreground font-bold">No hay partidas</p>
          <p className="text-sm text-muted-foreground mb-4">Crea tu primera partida de Remigio para empezar.</p>
          <Button onClick={goNew} className="rounded-full">
            <PlusCircle className="h-4 w-4" />
            Nueva partida
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Eliminar partida"
        description="¿Estás seguro de que quieres eliminar esta partida? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}