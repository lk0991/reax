# Component anatomy catalog (research ticket #8)

Status: IN PROGRESS. Sections marked PENDING are not yet researched.

## Method and source reachability

The published documentation sites were NOT reachable through the network proxy (CONNECT 403 or DNS failure): www.w3.org (APG site), developer.mozilla.org, html.spec.whatwg.org, www.radix-ui.com, react-aria.adobe.com, ui.shadcn.com, headlessui.com, m3.material.io, carbondesignsystem.com, polaris-react.shopify.com, primer.style. Nothing from those sites is cited or filled from memory.

Reachable: public GitHub repositories (shallow `git clone` and raw file access). Each source's own repository is a primary source (the owner's source of truth), so claims cite files at the pinned commit:

| Family | Repo @ commit |
|---|---|
| APG | https://github.com/w3c/aria-practices @ f14b249 (`content/patterns/*`) |
| HTML spec | https://github.com/whatwg/html @ 0e292f4 (`source`) |
| MDN | https://github.com/mdn/content @ df622a2 (`files/en-us/web/html/reference/elements`) |
| Radix | https://github.com/radix-ui/primitives @ eb3a2b7 |
| React Aria | https://github.com/adobe/react-spectrum @ 6be3466 (`packages/react-aria-components`) |
| shadcn/ui | https://github.com/shadcn-ui/ui @ bfa64ff (`apps/v4/registry/new-york-v4/ui`) |
| Headless UI | https://github.com/tailwindlabs/headlessui @ eea57cf (`packages/@headlessui-react`) |
| Carbon | https://github.com/carbon-design-system/carbon @ 021b538 |
| Polaris | https://github.com/Shopify/polaris @ 3f7954a |
| Primer | https://github.com/primer/react @ 2128032 ; https://github.com/primer/design @ 87f799f |
| Material | https://github.com/material-components/material-web @ a0bab1d (implementation only; the Material 3 guidelines site was unreachable) |

Marking: claims with a cited file path are verified against that file. Anything labelled "unverified" comes from memory.

Legend for URLs below: `APG:<pattern>` = `https://github.com/w3c/aria-practices/blob/f14b249/content/patterns/<pattern>`; `RDX:<pkg>` = `https://github.com/radix-ui/primitives/blob/eb3a2b7/packages/react/<pkg>/src/<pkg>.tsx`; `RAC:<Name>` = `https://github.com/adobe/react-spectrum/blob/6be3466/packages/react-aria-components/src/<Name>.tsx`; `SHAD:<name>` = `https://github.com/shadcn-ui/ui/blob/bfa64ff/apps/v4/registry/new-york-v4/ui/<name>.tsx`; `HUI:<name>` = `https://github.com/tailwindlabs/headlessui/blob/eea57cf/packages/@headlessui-react/src/components/<name>/<name>.tsx`.

## Cross-cutting notes (mobile-first, 44px, WCAG AA)

- shadcn default Button is `h-9` (36px) and `icon` is `size-9`; `xs` is `h-6` (SHAD:button). These are below 44px; a mobile-first default must raise the hit area to 44px (padding or pseudo-element), which no surveyed library does by default.
- WCAG target-size thresholds (24px AA in 2.2, 44px AAA) are from the WCAG spec, which was not fetched: unverified.
- APG says alerts must not steal focus and should not disappear automatically (APG:alert/alert-pattern.html), which bears directly on toast auto-dismiss timing (WCAG 2.2.1/2.2.3 referenced there).

## Summary table (PENDING: filled at end)

## Components

### Button
- APG: Space and Enter activate; role `button`; accessible name from content, `aria-label` or `aria-labelledby`; `aria-describedby` for description; unavailable action uses `aria-disabled="true"`; toggle button uses `aria-pressed` and the label must not change with state; menu button uses `aria-haspopup` (APG:button/button-pattern.html).
- Radix has no Button primitive (not in the package list at eb3a2b7).
- React Aria Button: `isDisabled`, `isPending` (disables press and hover but keeps focusability and announces pending), render-state attributes `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`, `data-disabled`, `data-pending` (RAC:Button).
- shadcn Button variants: `default, destructive, outline, secondary, ghost, link`; sizes: `default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg`; `asChild` (SHAD:button).
- Headless UI Button: `autoFocus`, `disabled`; data attributes focus/hover/active/disabled (HUI:button).

PENDING: MDN/HTML (type, disabled, form attrs), Carbon, Polaris, Primer, Material.

### Input / text field
- shadcn Input is a styled native `input` with `aria-invalid` styling, `h-9` (SHAD:input).
- React Aria TextField state: `isDisabled, isInvalid, isReadOnly, isRequired`; `validationBehavior: 'aria' | 'native'` (RAC:TextField; types in packages/@react-types/shared/src/inputs.d.ts).
- Headless UI Input: `invalid`, `disabled`, `autoFocus` (HUI:input).

PENDING: MDN/HTML, design systems.

### Checkbox
- APG: Space toggles; role `checkbox`; `aria-checked` true/false/mixed; group with `role="group"` and `aria-labelledby` (APG:checkbox/checkbox-pattern.html).
- Radix: `checked` (`CheckedState` includes indeterminate), `defaultChecked`, `onCheckedChange`, `required`, `disabled`, `name`, `value`, `form`; renders `button role="checkbox"` with `aria-checked` ("mixed" when indeterminate), `data-state`, `data-disabled` (RDX:checkbox).
- React Aria: `isSelected`, `isIndeterminate`, `isInvalid`, `isRequired`, `isReadOnly`, `isDisabled` (RAC:Checkbox).
- Headless UI: `checked, defaultChecked, indeterminate, onChange, disabled, name, value` (HUI:checkbox).

### Radio / radio group
- APG: `radiogroup` + `radio`; roving tabindex: focus enters on checked radio or the first; arrows move focus and check, wrapping; Space checks (APG:radio/radio-group-pattern.html). APG notes native browsers differ on Shift+Tab entry.
- Radix RadioGroup: `value, defaultValue, onValueChange, name, required, disabled, orientation, dir, loop`; `role="radiogroup"` with `aria-required`, `aria-orientation` (RDX:radio-group).
- React Aria: render states `isSelected, isInvalid, isReadOnly, isRequired, isDisabled`, `data-orientation` (RAC:RadioGroup).

### Select
- APG select-only combobox: `role=combobox` with `aria-controls`, `aria-expanded`, `aria-activedescendant`; closed keys: Down/Alt+Down/Enter/Space open; Home/End open and move; printable chars type-ahead (APG:combobox/examples/combobox-select-only.html, combobox-pattern.html).
- Radix Select: `value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, name, disabled, required, dir, form`; trigger `role="combobox"` `aria-autocomplete="none"`, `data-placeholder` (RDX:select).
- React Aria Select: `isOpen, isDisabled, isInvalid, isRequired, isPlaceholder` (RAC:Select).
- shadcn Select: trigger `size: default | sm` (SHAD:select); also `native-select.tsx` exists.
- Headless UI has a native `Select` wrapper: `invalid, disabled, autoFocus` (HUI:select).

### Modal / dialog
- APG: role `dialog` (or `alertdialog`), `aria-modal="true"`, label via `aria-labelledby` or `aria-label`, optional `aria-describedby`; focus moves in on open; Tab wraps; Escape closes; focus returns to invoker; strongly recommended visible close button; focus the least destructive action for irreversible confirmations; `aria-modal` only if outside content is truly inert (APG:dialog-modal/dialog-modal-pattern.html, APG:alertdialog/alertdialog-pattern.html).
- Radix Dialog: `open, defaultOpen, onOpenChange, modal`; Content: `onOpenAutoFocus, onCloseAutoFocus, onEscapeKeyDown, onPointerDownOutside, onInteractOutside`; trigger has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`; content `role="dialog"` with `aria-labelledby` only when a Title is present (RDX:dialog). Separate `alert-dialog` package exists.
- React Aria Modal: `isDismissable` (outside click) and `isKeyboardDismissDisabled`, entering/exiting states (RAC:Modal).
- shadcn Dialog: `showCloseButton` default true with sr-only "Close" label (SHAD:dialog).
- Headless UI Dialog: `open, onClose, role?: 'dialog' | 'alertdialog'`, sets `aria-modal` (HUI:dialog).

### Tabs
- APG: `tablist`/`tab`/`tabpanel`; `aria-selected`, `aria-controls`, panel `aria-labelledby`; Left/Right (Up/Down if `aria-orientation=vertical`), Home/End optional; automatic activation recommended when panels load without latency; panel gets `tabindex=0` if first content is not focusable (APG:tabs/tabs-pattern.html).
- Radix: `value, defaultValue, onValueChange, orientation, dir, activationMode` default automatic; List `loop`; Trigger `value, disabled` (RDX:tabs).
- React Aria: `keyboardActivation` default `automatic`, `orientation` default horizontal (RAC:Tabs).
- shadcn: list variants `default | line`, `orientation` (SHAD:tabs).

### Card
- No APG pattern, no Radix, React Aria or Headless UI primitive.
- shadcn Card: composed of Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter as plain divs, no variants (SHAD:card).

PENDING: Carbon Tile, Polaris Card, Primer, Material.

### Toast
- APG alert: role `alert`, no keyboard interaction, must not move focus, avoid auto-disappearing (APG:alert/alert-pattern.html).
- Radix Toast: `duration` default 5000ms, `type: foreground | background`, `swipeDirection`, `swipeThreshold` 50, viewport `role="region"` label "Notifications ({hotkey})" hotkey F8; toast `role="status"` with `aria-live` assertive for foreground and polite for background, with a code comment that role=alert is avoided to prevent screen-reader stuttering (RDX:toast).
- shadcn uses the Sonner library with `success, info, warning, error, loading` icons (SHAD:sonner).
- DISAGREEMENT: APG says `alert`; Radix deliberately uses `status` plus aria-live.

### Tooltip
- APG: the tooltip pattern is explicitly work in progress with no task-force consensus; role `tooltip`, trigger references it with `aria-describedby`, Escape dismisses, tooltip never takes focus (APG:tooltip/tooltip-pattern.html).
- Radix: `delayDuration` default 700ms, `skipDelayDuration`, `disableHoverableContent`; content `role="tooltip"` inside a visually hidden node, trigger `aria-describedby` (RDX:tooltip).
- React Aria: `data-placement`, entering/exiting states (RAC:Tooltip).
- Mobile note: hover-only tooltips have no touch equivalent; keep essential information out of tooltips.

### Accordion
- APG: header button inside a heading with `aria-level`, `aria-expanded`, `aria-controls`; Enter/Space toggles; panels optional `role=region` with `aria-labelledby` (avoid with more than about 6 open panels); `aria-disabled` on the open header when collapse is not allowed (APG:accordion/accordion-pattern.html).
- Radix: `type: single | multiple`, `value/defaultValue` (string or string[]), `collapsible`, `disabled`, `orientation`; `data-state`, `aria-disabled`, panel `role="region"` (RDX:accordion).
- React Aria Disclosure: `isExpanded`, `isDisabled` (RAC:Disclosure).
- APG disclosure: button with `aria-expanded`, optional `aria-controls` (APG:disclosure/disclosure-pattern.html).

### Menu
- APG menu button: Enter/Space (optionally Down/Up) open and focus first (last for Up); `aria-haspopup` menu/true; `aria-expanded` (APG:menu-button/menu-button-pattern.html). Menu: roles `menu`, `menuitem`, `menuitemcheckbox`, `menuitemradio`; Up/Down wrap, Home/End, type-ahead, Enter activates, Escape closes and refocuses the button (APG:menubar/menu-and-menubar-pattern.html, menu-button/examples/menu-button-actions.html).
- Radix DropdownMenu trigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls` (RDX:dropdown-menu, via packages/react/dropdown-menu/src/dropdown-menu.tsx).
- React Aria Menu: `isOpen`, `isEmpty`, selection mode, submenu state (RAC:Menu).

### Table
- APG: static table, no keyboard interaction; use native `table` where possible; roles table/row/columnheader/rowheader/cell; `aria-sort` on sorted header; `aria-rowcount/colcount/rowindex/colindex` if rows are virtualised; use grid if interactive (APG:table/table-pattern.html).
- shadcn Table: thin wrappers over `table, thead, tbody, tfoot, tr, th, td, caption` (SHAD:table).
- React Aria Table: `data-sort-direction`, `data-allows-sorting`, selection, resizing, drag states (RAC:Table).

### Pagination
- No APG pattern, no Radix primitive.
- shadcn Pagination: `nav` with `aria-label="pagination"`, `aria-current="page"` on active link, Previous/Next with `aria-label="Go to previous page"`/`"Go to next page"`, ellipsis with sr-only "More pages" (SHAD:pagination).

PENDING: MDN `aria-current`, Carbon Pagination, Polaris, Primer.

### Badge
- shadcn Badge variants: `default, secondary, destructive, outline, ghost, link` (SHAD:badge). No APG/Radix/React Aria equivalent.

PENDING: Carbon Tag, Polaris Badge, Primer Label/CounterLabel, Material.

### Avatar
- Radix Avatar: image loading status `idle | loading | loaded | error`, `onLoadingStatusChange`, Fallback `delayMs` (RDX:avatar).
- shadcn Avatar: `size: default | sm | lg` (32/24/40px), plus AvatarBadge, AvatarGroup, AvatarGroupCount (SHAD:avatar).

PENDING: Polaris, Primer, Carbon UserAvatar.

### Form field
- shadcn Field: Field `orientation` (vertical default | horizontal | responsive), FieldLabel, FieldDescription, FieldSet/FieldLegend (`variant: legend | label`), FieldGroup; `role="group"` (SHAD:field).
- Headless UI: Field, Fieldset, Label, Description, Legend components (directory listing at eea57cf).
- React Aria: Label, Text slot (description), FieldError, Form with `validationBehavior` (RAC:Form, RAC:FieldError).

PENDING: MDN label/fieldset/autocomplete, Carbon, Polaris, Primer FormControl.

## Disagreements so far

1. Toast live region: APG `alert` vs Radix `status` + aria-live.
2. Tab activation: APG recommends automatic activation; Radix and React Aria default to automatic but allow manual.
3. Dialog outside-click dismissal: Radix dismisses on outside pointer by default; React Aria requires `isDismissable`.
4. Tooltip: APG pattern is not consensus.
