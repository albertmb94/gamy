import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Save, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useRemigioDefaults, REMIGIO_DEFAULTS } from '../../store/useRemigioDefaults';
import { useRemigioStore } from '../../store/useRemigioStore';
import { IntegerField, MoneyField } from '../components/NumberDraftInput';

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
    // Reflejar los valores canónicos reales del store (no literales sueltos).
    setPricePerRound(REMIGIO_DEFAULTS.defaultPricePerRound);
    setPricePerGame(REMIGIO_DEFAULTS.defaultPricePerGame);
    setPricePerReentry(REMIGIO_DEFAULTS.defaultPricePerReentry);
    setTargetScore(REMIGIO_DEFAULTS.defaultTargetScore);
    setPlayerNames(REMIGIO_DEFAULTS.defaultPlayerNames.length > 0 ? [...REMIGIO_DEFAULTS.defaultPlayerNames] : ['']);
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
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goList} className="rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Valores por defecto
          </CardTitle>
          <CardDescription>
            Se rellenarán automáticamente al crear una nueva partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Puntos objetivo</Label>
              <IntegerField
                id="targetScore"
                value={targetScore}
                onCommit={(n) => { if (n > 0) setTargetScore(n); }}
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pricePerRound">€ por ronda</Label>
              <MoneyField
                id="pricePerRound"
                value={pricePerRound}
                onCommit={setPricePerRound}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerGame">€ por partida</Label>
              <MoneyField
                id="pricePerGame"
                value={pricePerGame}
                onCommit={setPricePerGame}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerReentry">€ reenganche</Label>
              <MoneyField
                id="pricePerReentry"
                value={pricePerReentry}
                onCommit={setPricePerReentry}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Jugadores por defecto</CardTitle>
          <CardDescription>
            Nombres que aparecerán pre-rellenados al crear una partida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {playerNames.map((name, i) => (
            <div key={i} className="flex gap-2 items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`default-player-${i}`} className="text-xs">Jugador {i + 1}</Label>
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
                className="rounded-full"
                aria-label={`Quitar jugador ${i + 1}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addPlayerName} className="rounded-full">
            <Plus className="h-4 w-4" />
            Añadir jugador
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset} className="rounded-full">
          <RotateCcw className="h-4 w-4" />
          Restablecer
        </Button>
        <div className="flex items-center gap-3">
          {notice && (
            <span className="text-xs text-muted-foreground">
              {notice === 'saved' ? 'Ajustes guardados' : 'Ajustes restablecidos'}
            </span>
          )}
          <Button onClick={handleSave} className="rounded-full">
            <Save className="h-4 w-4" />
            Guardar ajustes
          </Button>
        </div>
      </div>
    </div>
  );
}