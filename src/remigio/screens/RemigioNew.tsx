import { useState } from 'react';
import { Plus, Minus, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useRemigioStore } from '../../store/useRemigioStore';
import { useRemigioDefaults } from '../../store/useRemigioDefaults';

export function RemigioNew() {
  const { create, openSession, goList, goSettings } = useRemigioStore();
  const defaults = useRemigioDefaults();

  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [targetScore, setTargetScore] = useState(defaults.defaultTargetScore);
  const [pricePerRound, setPricePerRound] = useState(defaults.defaultPricePerRound);
  const [pricePerGame, setPricePerGame] = useState(defaults.defaultPricePerGame);
  const [pricePerReentry, setPricePerReentry] = useState(defaults.defaultPricePerReentry);
  const [names, setNames] = useState<string[]>(() => {
    const stored = defaults.defaultPlayerNames;
    const count = Math.max(2, stored.length || 3);
    return Array.from({ length: count }, (_, i) => stored[i] ?? '');
  });

  const setNameAt = (i: number, v: string) =>
    setNames((arr) => arr.map((n, idx) => (idx === i ? v : n)));
  const addPlayer = () => setNames((arr) => (arr.length < 8 ? [...arr, ''] : arr));
  const removePlayer = () => setNames((arr) => (arr.length > 2 ? arr.slice(0, -1) : arr));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNames = names.map((n) => n.trim()).filter(Boolean);
    if (cleanNames.length < 2) {
      alert('Añade al menos 2 jugadores');
      return;
    }
    defaults.setDefaults({
      defaultTargetScore: targetScore,
      defaultPricePerRound: pricePerRound,
      defaultPricePerGame: pricePerGame,
      defaultPricePerReentry: pricePerReentry,
      defaultPlayerNames: cleanNames,
    });
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
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" onClick={goList} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goSettings} className="rounded-full">
          <SettingsIcon className="h-4 w-4" />
          Ajustes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
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
                <Input id="targetScore" type="number" min={10} value={targetScore} onChange={(e) => setTargetScore(parseInt(e.target.value) || 150)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
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

        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle>Jugadores</CardTitle>
            <CardDescription>Añade los nombres de los jugadores.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {names.map((n, i) => (
              <div key={i} className="space-y-1.5">
                <Label htmlFor={`player-${i}`} className="text-xs">Jugador {i + 1}</Label>
                <Input id={`player-${i}`} value={n} onChange={(e) => setNameAt(i, e.target.value)} placeholder={`Nombre del jugador ${i + 1}`} required={i < 2} />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={removePlayer} disabled={names.length <= 2} className="rounded-full">
                <Minus className="h-4 w-4" />
                Quitar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addPlayer} disabled={names.length >= 8} className="rounded-full">
                <Plus className="h-4 w-4" />
                Añadir
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="rounded-full">Crear Partida</Button>
        </div>
      </form>
    </div>
  );
}