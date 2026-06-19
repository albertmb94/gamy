import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { startDbMonitor } from '../db/turso';

export default function DbIndicator() {
  const dbStatus = useStore(s => s.dbStatus);
  const setDbStatus = useStore(s => s.setDbStatus);
  const pendingSyncQueue = useStore(s => s.pendingSyncQueue);
  const syncPendingItems = useStore(s => s.syncPendingItems);

  useEffect(() => {
    const cleanup = startDbMonitor(setDbStatus);
    return cleanup;
  }, [setDbStatus]);

  const color =
    dbStatus === 'connected' ? 'bg-green-500' :
    dbStatus === 'reconnecting' ? 'bg-orange-400' :
    dbStatus === 'local' ? 'bg-sky-500' :
    'bg-gray-400';

  const label =
    dbStatus === 'connected' ? 'Conectado' :
    dbStatus === 'reconnecting' ? 'Reconectando...' :
    dbStatus === 'local' ? 'Local' :
    'Desconectado';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color} ${dbStatus === 'reconnecting' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
      {pendingSyncQueue.length > 0 && (
        <button
          onClick={syncPendingItems}
          className="text-xs text-foreground hover:opacity-70 underline"
          title="Intentar sincronizar cambios pendientes"
        >
          ({pendingSyncQueue.length} pendientes)
        </button>
      )}
    </div>
  );
}
