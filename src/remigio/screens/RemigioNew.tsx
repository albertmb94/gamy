import { useState } from 'react';
import { Plus, Minus, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useRemigioStore } from '../../store/useRemigioStore';

const SETTINGS_KEY = 'remigio-defaults';

interface Defaults {
  targetScore: number;
  pricePerRound: number;
  pricePerGame: number;
  pricePerReentry: number;
  playerNames: string[];
}

function loadDefaults(): Defaults {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return base;
}

const base: Defaults = {
  targetScore: 100,
  pricePerRound: 0,
  pricePerGame: 0,
  pricePerReentry: 0,
  playerNames: [],
};

export function RemigioNew() {
  const { create, openSession, goList } = useRemigioStore();
  const defaults = loadDefaults();

  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [targetScore, setTargetScore] = useState(defaults.targetScore);
  const [pricePerRound, setPricePerRound] = useState(defaults.pricePerRound);
  const [pricePerGame, setPricePerGame] = useState(defaults.pricePerGame);
  const [pricePerReentry, setPricePerReentry] = useState(defaults.pricePerReentry);
  const [names, setNames] = useState<string[]>(
    defaults.playerNames.length >= 2 ? defaults.playerNames : ['', '', ''],
  );

  const setNameAt = (i: number, v: string) => setNames((arr) => arr.map((n, idx) => (idx === i ? v : n)));
  const addPlayer = () => setNames((arr) => (arr.length < 8 ? [...arr, ''] : arr));
  const removePlayer = () => setNames((arr) => (arr.length > 2 ? arr.slice(0, -1) : arr));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNames = names.map((n) => n.trim()).filter(Boolean);
    if (cleanNames.length < 2) {
      alert('Añade al menos 2 jugadores');
      return;
    }
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ targetScore, pricePerRound, pricePerGame, pricePerReentry, playerNames: cleanNames }),
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
            <CardDescription>Añade los nombres de los jugadores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {names.map((n, i) => (
              <div key={i} className="space-y-2">
                <Label htmlFor={`player-${i}`}>Jugador {i + 1}</Label>
                <Input id={`player-${i}`} value={n} onChange={(e) => setNameAt(i, e.target.value)} placeholder={`Nombre del jugador ${i + 1}`} required={i < 2} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={removePlayer} disabled={names.length <= 2}>
                <Minus className="h-4 w-4" />
                Quitar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addPlayer} disabled={names.length >= 8}>
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">Crear Partida</Button>
        </div>
      </form>
    </div>
  );
}
