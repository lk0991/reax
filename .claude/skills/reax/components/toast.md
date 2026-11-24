# Card: Toast

A short status message that appears without interrupting, such as "Saved". It never takes focus. Also read `_rules.md`.

## Native first
A live region that exists in the page before messages are added: `role="status"` (polite) for information and success, `role="alert"` for errors.

## Anatomy
`region` (the live region, holds the stack) > `toast` > optional `icon`, `title`, optional `description`, optional `action`, `dismiss`.

## Props
```ts
interface ToastOptions {
  title: string;
  description?: string;
  intent?: 'neutral' | 'success' | 'warning' | 'danger';   // default 'neutral'
  /** One optional action. The same action must also be reachable elsewhere. */
  action?: { label: string; onAction: () => void };
  /** ms before it hides. Ignored for danger: errors stay until dismissed. */
  duration?: number;                                       // default 6000
}
```

## Variants
Neutral, success, warning, danger; with an action.

## States, mapped to stories
one toast, a stack of three, with action, danger (stays), long text, 320px, 200% text. Stories show the toast already present (args), not a timer.

## Requirements
- Messages are announced without moving focus: a polite live region, an assertive one for errors (4.1.3).
- A toast that hides by itself gives enough time: it pauses while hovered or focused, or it can be turned off or extended (2.2.1).
- It can be dismissed with a control that has an accessible name (2.1.1, 4.1.2).
- Meaning is not carried by colour alone: the title or an icon with a name says it (1.4.1).

## Defaults
- Errors never hide by themselves.
- Never steal focus. A toast's action is a shortcut; the same action exists elsewhere.
- At most three visible; newer ones stack.

## Mobile
Full width at the bottom or top, above the on-screen keyboard, and never covering the main action.

## Review checks
1. The live region is created together with the message (not announced). 2. Focus moves to the toast. 3. An error hides by itself. 4. No dismiss control, or it has no name. 5. Intent by colour only.
