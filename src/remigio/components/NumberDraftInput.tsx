import { useState } from 'react';
import { Input } from '../../components/ui/input';

interface BaseProps {
  id?: string;
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
  className?: string;
  inputMode?: 'numeric' | 'decimal';
  'aria-label'?: string;
}

/**
 * Input numérico con borrador en string.
 *
 * Problema que resuelve: los campos controlados con `value={0}` (number)
 * renderizan un "0" hardcoded y colapsan estados intermedios ("", ".", "0.")
 * a 0 en cada tecla, lo que impide escribir decimales con naturalidad.
 *
 * Comportamiento ("mostrar vacío si 0"):
 * - Si el valor confirmado es 0 y el campo no está en edición, se muestra
 *   vacío con placeholder (p. ej. "0.00").
 * - Mientras se edita se conserva el texto tal cual (draft), permitiendo
 *   ".", "0.", "12." sin que el cursor salte.
 * - El valor numérico confirmado se propaga al padre en cada cambio válido
 *   (para que el submit funcione sin necesidad de blur previo) y se
 *   normaliza al perder el foco.
 */
export function MoneyField({
  value,
  onCommit,
  ...rest
}: BaseProps & { value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (value === 0 ? '' : String(value));

  const commitRaw = (raw: string) => {
    if (raw.trim() === '') {
      onCommit(0);
      return;
    }
    const n = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(n) && n >= 0) onCommit(n);
    // Si no es parseable (".", "-", etc.) no se propaga: se espera al blur.
  };

  return (
    <Input
      type="number"
      min={0}
      step="0.01"
      inputMode="decimal"
      placeholder="0.00"
      {...rest}
      value={display}
      onFocus={(e) => {
        setDraft(value === 0 ? '' : String(value));
        // Seleccionar por si el navegador no vació (valores != 0): escribir sustituye.
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        commitRaw(e.target.value);
      }}
      onBlur={(e) => {
        commitRaw(e.target.value);
        setDraft(null);
      }}
    />
  );
}

export function IntegerField({
  value,
  onCommit,
  min = 1,
  ...rest
}: BaseProps & { value: number; onCommit: (v: number) => void; min?: number }) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? String(value);

  const commitRaw = (raw: string): boolean => {
    if (raw.trim() === '') return false;
    const n = parseInt(raw, 10);
    if (Number.isNaN(n)) return false;
    const lo = min ?? 1;
    const hi = rest.max ?? Number.MAX_SAFE_INTEGER;
    if (n < lo || n > hi) return false;
    onCommit(n);
    return true;
  };

  return (
    <Input
      type="number"
      inputMode="numeric"
      {...rest}
      min={min}
      value={display}
      onFocus={(e) => {
        setDraft(String(value));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => {
        setDraft(e.target.value);
        commitRaw(e.target.value);
      }}
      onBlur={(e) => {
        // Vacío o inválido al salir: se revierte al último valor válido
        // mostrando de nuevo el commit del padre.
        commitRaw(e.target.value);
        setDraft(null);
      }}
    />
  );
}
