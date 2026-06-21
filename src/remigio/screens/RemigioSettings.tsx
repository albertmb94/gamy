import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Save, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useRemigioDefaults } from '../../store/useRemigioDefaults';
import { useRemigioStore } from '../../store/useRemigioStore';

type Notice = 'saved' | 'reset' | null;

export function RemigioSettings() {
  const goList = useRemigioStore((s) => s.goList);
  const stored = useRemigioDefaults();

  const [pricePerRound, setPricePerRound] = useState(stored.defaultPricePerRound);
  const [pricePerGame, setPricePerGame] = useState(stored.defaultPricePerGame);
  const [pricePerReentry, setPricePerReentry] = useState(stored.defaultPricePerReentry);
  const [targetScore, setTargetScore] = useState(stored.defaultTargetScore);
  const [playerNames, setPlayerNames] = useState<string[]>(
    stored.defaultPlayerNames.length > 0 ? stored.defaultPlayerNames : [''],
  );
  const [notice, setNotice] = useState<Notice>(null);

  const handleSave = () => {
    stored.setDefaults({
      defaultPricePerRound: pricePerRound,
      defaultPricePerGame: pricePerGame,
      defaultPricePerReentry: pricePerReentry,
      defaultTargetScore: targetScore,
      defaultPlayerNames: playerNames.map((n) => n.trim()).filter((n) => n !== ''),
    });
    setNotice('saved');
  };

  const handleReset = () => {
    stored.resetDefaults();
    setPricePerRound(0);
    setPricePerGame(0);
    setPricePerReentry(0);
    setTargetScore(150);
    setPlayerNames(['']);
    setNotice('reset');
  };

  const addPlayerName = () => setPlayerNames((arr) => [...arr, '']);
  const removePlayerName = (i: number) =>
    setPlayerNames((arr) => {
      const next = arr.filter((_, idx) => idx !== i);
      return next.length > 0 ? next : [''];
    });
  const updatePlayerName = (i: number, value: string) =>
    setPlayerNames((arr) => arr.map((n, idx) => (idx === i ? value : n)));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goList}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Valores por defecto de partidas
          </CardTitle>
          <CardDescription>
            Se rellenarán automáticamente al crear una nueva partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Puntos objetivo</Label>
              <Input
                id="targetScore"
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || 150)}
                min={50}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerRound">€ por ronda</Label>
              <Input
                id="pricePerRound"
                type="number"
                step="0.01"
                value={pricePerRound}
                onChange={(e) => setPricePerRound(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerGame">€ por partida</Label>
              <Input
                id="pricePerGame"
                type="number"
                step="0.01"
                value={pricePerGame}
                onChange={(e) => setPricePerGame(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerReentry">€ reenganche</Label>
              <Input
                id="pricePerReentry"
                type="number"
                step="0.01"
                value={pricePerReentry}
                onChange={(e) => setPricePerReentry(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores por defecto</CardTitle>
          <CardDescription>
            Nombres que aparecerán pre-rellenados al crear una partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`default-player-${i}`}>Jugador {i + 1}</Label>
                <Input
                  id={`default-player-${i}`}
                  value={name}
                  onChange={(e) => updatePlayerName(i, e.target.value)}
                  placeholder={`Nombre del jugador ${i + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePlayerName(i)}
                disabled={playerNames.length <= 1}
                aria-label={`Quitar jugador ${i + 1}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addPlayerName}>
            <Plus className="h-4 w-4" />
            Añadir jugador
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Restablecer
        </Button>
        <div className="flex items-center gap-3">
          {notice && (
            <span className="text-xs text-muted-foreground">
              {notice === 'saved' ? 'Ajustes guardados' : 'Ajustes restablecidos'}
            </span>
          )}
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Guardar ajustes
          </Button>
        </div>
      </div>
    </div>
  );
}