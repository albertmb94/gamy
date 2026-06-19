import { PlusCircle, Users, Trophy, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useRemigioStore } from '../../store/useRemigioStore';
import { statusLabel } from '../engine';
import { RemigioSession } from '../types';

function SessionCard({ session, onOpen, onDelete }: { session: RemigioSession; onOpen: () => void; onDelete: () => void }) {
  const finished = session.status === 'finished';
  const paused = session.status === 'paused' || (session.status === 'waiting' && session.rounds.length > 0);
  return (
    <Card className={finished ? 'opacity-80' : 'hover:border-foreground/30 transition-colors'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base truncate">{session.name}</CardTitle>
          <Badge variant={finished ? 'outline' : paused ? 'secondary' : 'success'}>{statusLabel(session.status)}</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {session.players.length} jugadores
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {paused ? (
              <span className="flex items-center gap-1 text-amber-600">
                <Pause className="h-3 w-3" /> {session.rounds.length} rondas
              </span>
            ) : (
              <>Objetivo: {session.target_score} pts</>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="ghost" size="icon" onClick={onDelete} title="Eliminar">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button size="sm" variant={finished ? 'outline' : 'default'} onClick={onOpen}>
              {finished ? 'Ver resumen' : paused ? (<><Play className="h-4 w-4" />Reanudar</>) : 'Ver'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RemigioList() {
  const { sessions, goNew, openSession, remove } = useRemigioStore();
  const active = sessions.filter((s) => s.status !== 'finished');
  const finished = sessions.filter((s) => s.status === 'finished');

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta partida?')) remove(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Remigio</h1>
          <p className="text-muted-foreground mt-1 text-sm">Partidas, puntuaciones y pagos.</p>
        </div>
        <Button onClick={goNew}>
          <PlusCircle className="h-4 w-4" />
          Nueva Partida
        </Button>
      </div>

      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Partidas activas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <SessionCard key={s.id} session={s} onOpen={() => openSession(s.id)} onDelete={() => handleDelete(s.id)} />
            ))}
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Partidas finalizadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {finished.map((s) => (
              <SessionCard key={s.id} session={s} onOpen={() => openSession(s.id)} onDelete={() => handleDelete(s.id)} />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay partidas</h3>
            <p className="text-muted-foreground mb-4 text-sm">Crea tu primera partida de Remigio para empezar.</p>
            <Button onClick={goNew}>
              <PlusCircle className="h-4 w-4" />
              Nueva Partida
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
