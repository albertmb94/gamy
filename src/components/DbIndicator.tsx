import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { startDbMonitor } from '../db/turso';

export default function DbIndicator() {
  const dbStatus = useStore(s => s.dbStatus);
  const setDbStatus = useStore(s => s.setDbStatus);
  const pendingSyncQueue = useStore(s => s.pendingSyncQueue);

  useEffect(() => {
    const cleanup = startDbMonitor(setDbStatus);
    return cleanup;
  }, [setDbStatus]);

  const color = dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'reconnecting' ? 'bg-orange-400' : 'bg-gray-400';
  const label = dbStatus === 'connected' ? 'Conectado' : dbStatus === 'reconnecting' ? 'Reconectando...' : 'Desconectado';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${color} animate-pulse`} />
      <span className="text-xs text-gray-400">{label}</span>
      {pendingSyncQueue.length > 0 && (
        <span className="text-xs text-amber-400">({pendingSyncQueue.length} pendientes)</span>
      )}
    </div>
  );
}
