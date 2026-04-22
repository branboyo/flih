import { useState } from 'react';

interface PitchShiftControlsProps {
  disabled: boolean;
  onApply: (semitones: number, cents: number, preserveFormants: boolean) => void;
}

export default function PitchShiftControls({
  disabled,
  onApply,
}: PitchShiftControlsProps) {
  const [semitones, setSemitones] = useState(0);
  const [cents, setCents] = useState(0);
  const [preserveFormants, setPreserveFormants] = useState(false);

  const handleReset = () => {
    setSemitones(0);
    setCents(0);
    setPreserveFormants(false);
  };

  const semLabel =
    semitones === 0 ? '0 st' : `${semitones > 0 ? '+' : ''}${semitones} st`;
  const centsLabel =
    cents === 0 ? '0 ¢' : `${cents > 0 ? '+' : ''}${cents} ¢`;
  const isZero = semitones === 0 && cents === 0;

  return (
    <div className="mx-4 rounded-md border border-gray-700 bg-gray-900 px-3 py-3">
      {/* Summary */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Pitch Shift
        </span>
        <span className="font-mono text-xs text-cyan-400">
          {semLabel} {centsLabel}
        </span>
      </div>

      {/* Semitone slider */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
          <span>Semitones</span>
          <span className="text-gray-300">{semLabel}</span>
        </div>
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={semitones}
          onChange={(e) => setSemitones(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-500 disabled:opacity-50"
        />
        <div className="mt-0.5 flex justify-between text-[9px] text-gray-600">
          <span>-12</span>
          <span>0</span>
          <span>+12</span>
        </div>
      </div>

      {/* Cents slider */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-gray-500">
          <span>Fine-tune (cents)</span>
          <span className="text-gray-300">{centsLabel}</span>
        </div>
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={cents}
          onChange={(e) => setCents(Number(e.target.value))}
          disabled={disabled}
          className="w-full accent-cyan-500 disabled:opacity-50"
        />
        <div className="mt-0.5 flex justify-between text-[9px] text-gray-600">
          <span>-100</span>
          <span>0</span>
          <span>+100</span>
        </div>
      </div>

      {/* Formant toggle */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">Preserve Formants</span>
        <button
          type="button"
          onClick={() => setPreserveFormants((v) => !v)}
          disabled={disabled}
          aria-pressed={preserveFormants}
          className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
            preserveFormants ? 'bg-cyan-600' : 'bg-gray-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              preserveFormants ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onApply(semitones, cents, preserveFormants)}
          disabled={disabled || isZero}
          className="flex-1 rounded-md bg-cyan-700 py-1.5 text-xs text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? 'Processing…' : 'Apply'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="text-xs text-gray-500 hover:text-gray-300 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
