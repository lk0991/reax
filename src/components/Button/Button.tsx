import * as React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Emphasis of the button. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Meaning of the action. `danger` also shows through the style, never colour alone: keep the label explicit. */
  intent?: 'neutral' | 'danger';
  /** Size of the button. */
  size?: 'sm' | 'md' | 'lg';
  /** Pending state: sets `aria-busy`, keeps focus, ignores presses and shows a spinner. */
  loading?: boolean;
  /** Stretch to the width of the container. Opt-in. */
  fullWidth?: boolean;
  /** Icon shown before the label. Decorative: it is hidden from assistive technology. */
  startIcon?: React.ReactNode;
  /** Icon shown after the label. Decorative: it is hidden from assistive technology. */
  endIcon?: React.ReactNode;
  /** Required when the button has no text (icon-only). */
  'aria-label'?: string;
}

/**
 * A native button for actions. Use a link for navigation.
 * `type` defaults to "button", never to submit.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    intent = 'neutral',
    size = 'md',
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    type = 'button',
    onClick,
    className,
    children,
    ...rest
  },
  ref,
) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const classes = ['reax-button', className].filter(Boolean).join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={classes}
      data-slot="button"
      data-variant={variant}
      data-intent={intent}
      data-size={size}
      data-loading={loading || undefined}
      data-full-width={fullWidth || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? <span className="reax-button__spinner" data-slot="spinner" aria-hidden="true" /> : null}
      {startIcon && !loading ? (
        <span className="reax-button__icon" data-slot="icon" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children !== undefined && children !== null ? (
        <span className="reax-button__label" data-slot="label">
          {children}
        </span>
      ) : null}
      {endIcon ? (
        <span className="reax-button__icon" data-slot="icon" aria-hidden="true">
          {endIcon}
        </span>
      ) : null}
    </button>
  );
});
