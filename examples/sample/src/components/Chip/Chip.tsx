import * as React from 'react';
import './Chip.css';

export interface ChipProps {
  /** Text of the chip. */
  label: string;
  /** Called when the remove control is pressed. */
  onRemove?: () => void;
}

/**
 * A removable chip. DELIBERATELY BROKEN for the sample: the remove control has no accessible name,
 * the text has low contrast and is sized in px. The visual test must flag it.
 */
export function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="sample-chip" data-slot="chip">
      <span data-slot="label">{label}</span>
      <button type="button" className="sample-chip__remove" data-slot="remove" onClick={onRemove}>
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" /></svg>
      </button>
    </span>
  );
}
