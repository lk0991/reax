import * as React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Emphasis of the button. */
  variant?: 'primary' | 'secondary';
  /** Pending state: sets `aria-busy`, keeps focus and ignores presses. */
  loading?: boolean;
}

/** A native button for actions. `type` defaults to "button". */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, type = 'button', onClick, children, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className="sample-button"
      data-slot="button"
      data-variant={variant}
      aria-busy={loading || undefined}
      onClick={(e) => { if (loading) { e.preventDefault(); return; } onClick?.(e); }}
    >
      <span data-slot="label">{children}</span>
    </button>
  );
});
