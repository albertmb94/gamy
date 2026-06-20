import { useState } from 'react';
import { Plus, ArrowLeft, Check, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useRemigioStore } from '../../store/useRemigioStore';
import { cn } from '../../utils/cn';

const SETTINGS_KEY = 'remigio-defaults';

interface Defaults {
  targetScore: number;
  pricePerRound: number;
  pricePerGame: number;
  pricePerReentry: number;
}

const base: Defaults = {
  targetScore: 100,
  pricePerRound: 0,
  pricePerGame: 0,
  pricePerReentry: 0,
};

function loadDefaults(): Defaults {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return base;
}

export function RemigioNew() {
  const { create, openSession, goList, roster, addRosterPlayer, removeRosterPlayer } = useRemigioStore();
  const defaults = loadDefaults();

  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [targetScore, setTargetScore] = useState(defaults.targetScore);
  const [pricePerRound, setPricePerRound] = useState(defaults.pricePerRound);
  const [pricePerGame, setPricePerGame] = useState(defaults.pricePerGame);
  const [pricePerReentry, setPricePerReentry] = useState(defaults.pricePerReentry);
  // Por defecto, todos los jugadores habituales quedan seleccionados.
  const [selected, setSelected] = useState<string[]>(roster);
  const [newPlayer, setNewPlayer] = useState('');

  const toggle = (n: string) =>
    setSelected((arr) => (arr.includes(n) ? arr.filter((x) => x !== n) : [...arr, n]));

  const handleAddPlayer = () => {
    const trimmed = newPlayer.trim();
    if (!trimmed) return;
    if (roster.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      // Ya existe: simplemente asegúrate de que queda seleccionado.
      const existing = roster.find((n) => n.toLowerCase() === trimmed.toLowerCase())!;
      setSelected((arr) => (arr.includes(existing) ? arr : [...arr, existing]));
    } else {
      addRosterPlayer(trimmed);
      setSelected((arr) => [...arr, trimmed]);
    }
    setNewPlayer('');
  };

  const handleRemovePlayer = (n: string) => {
    removeRosterPlayer(n);
    setSelected((arr) => arr.filter((x) => x !== n));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNames = selected.map((n) => n.trim()).filter(Boolean);
    if (cleanNames.length < 2) {
      alert('Selecciona al menos 2 jugadores');
      return;
    }
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ targetScore, pricePerRound, pricePerGame, pricePerReentry }),
      );
    } catch {
      /* ignore */
    }
    const id = create({
      name: name.trim() || 'Partida de Remigio',
      maxPlayers,
      targetScore,
      pricePerRound,
      pricePerGame,
      pricePerReentry,
      playerNames: cleanNames,
    });
    openSession(id);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goList}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nueva partida de Remigio</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Define las reglas y los precios de la partida.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la partida</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Partida del sábado" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Máx. jugadores</Label>
                <Input id="maxPlayers" type="number" min={2} max={8} value={maxPlayers} onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 8)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetScore">Puntos objetivo</Label>
                <Input id="targetScore" type="number" min={10} value={targetScore} onChange={(e) => setTargetScore(parseInt(e.target.value) || 100)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ppr">€ por ronda</Label>
                <Input id="ppr" type="number" step="0.01" value={pricePerRound} onChange={(e) => setPricePerRound(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ppg">€ por partida</Label>
                <Input id="ppg" type="number" step="0.01" value={pricePerGame} onChange={(e) => setPricePerGame(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ppre">€ reenganche</Label>
                <Input id="ppre" type="number" step="0.01" value={pricePerReentry} onChange={(e) => setPricePerReentry(parseFloat(e.target.value) || 0)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jugadores</CardTitle>
            <CardDescription>
              Selecciona quién juega. Añade o elimina jugadores habituales; quedan guardados para próximas partidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPlayer(); } }}
                placeholder="Nombre del jugador"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddPlayer} aria-label="Añadir jugador">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {roster.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mb-2" />
                <p className="text-sm">Aún no hay jugadores. Añade el primero arriba.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {roster.map((n) => {
                  const sel = selected.includes(n);
                  return (
                    <div key={n} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(n)}
                        className={cn(
                          'flex flex-1 items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          sel ? 'bg-secondary border-foreground/30 ring-1 ring-foreground/15' : 'bg-card border-border hover:bg-secondary',
                        )}
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                        >
                          {n.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex-1 font-medium text-foreground">{n}</span>
                        {sel && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemovePlayer(n)}
                        title={`Eliminar a ${n}`}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground">{selected.length} seleccionados</p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={selected.length < 2}>Crear Partida</Button>
        </div>
      </form>
    </div>
  );
}
