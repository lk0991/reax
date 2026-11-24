import * as React from 'react';
import './Dialog.css';

export interface DialogProps {
  /** Whether the dialog is open. */
  open: boolean;
  /** Called when the dialog asks to open or close. */
  onOpenChange: (open: boolean) => void;
  /** Required. Becomes the accessible name. */
  title: React.ReactNode;
  /** Dialog content. */
  children: React.ReactNode;
}

/** A modal dialog built on the native `dialog` element. */
export function Dialog({ open, onOpenChange, title, children }: DialogProps) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const returnTo = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) { returnTo.current = document.activeElement as HTMLElement | null; d.showModal(); }
    if (!open && d.open) { d.close(); }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sample-dialog"
      data-slot="dialog"
      aria-labelledby={titleId}
      onClose={() => { onOpenChange(false); returnTo.current?.focus(); }}
    >
      <header data-slot="header" className="sample-dialog__header">
        <h2 id={titleId} data-slot="title" className="sample-dialog__title">{title}</h2>
        <button type="button" data-slot="close" className="sample-dialog__close" aria-label="Close" onClick={() => onOpenChange(false)}>×</button>
      </header>
      <div data-slot="body">{children}</div>
    </dialog>
  );
}
