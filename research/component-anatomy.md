# Component anatomy catalog (research ticket #8)

Question: what is the standard anatomy (variants, props, states, accessibility) of each common UI component, so the `reax` skill can use it as generation defaults and as a `review` checklist? Design system agnostic; mobile-first, 44px touch targets and WCAG AA noted where they matter.

## Method and source reachability

The published documentation sites were NOT reachable through the network proxy (CONNECT 403 or DNS failure): www.w3.org (APG site), developer.mozilla.org, html.spec.whatwg.org, www.radix-ui.com, react-aria.adobe.com, ui.shadcn.com, headlessui.com, m3.material.io, carbondesignsystem.com, polaris-react.shopify.com, primer.style. Also blocked: the GitHub REST API for repos other than this one, cdn.jsdelivr.net and unpkg.com. Nothing is cited from those sites and nothing was filled from memory without a label.

Reachable: public GitHub repositories via shallow `git clone`. Each source's own repository is its primary source (the owner's source of truth: the APG pattern pages, the MDN article markdown, the WHATWG spec source, and the libraries' and design systems' own code and docs). Every claim cites a file at a pinned commit. This means the evidence for libraries and design systems is their implemented API (types, defaults, rendered ARIA), not their prose guidelines. Prose guidance from the Material 3, Carbon, Polaris and Primer sites was not readable, so statements about "design intent" (when to use which variant) are NOT made here.

URL legend (all GitHub `blob` URLs at the pinned commit):

| Tag | Base |
|---|---|
| `APG:x` | https://github.com/w3c/aria-practices/blob/f14b249/content/patterns/x |
| `HTML:Lnnn` | https://github.com/whatwg/html/blob/0e292f4/source#Lnnn |
| `MDN:x` | https://github.com/mdn/content/blob/df622a2/files/en-us/web/html/reference/elements/x/index.md ; `MDN-ARIA:x` = .../files/en-us/web/accessibility/aria/reference/x/index.md |
| `RDX:x` | https://github.com/radix-ui/primitives/blob/eb3a2b7/packages/react/x/src/x.tsx |
| `RAC:X` | https://github.com/adobe/react-spectrum/blob/6be3466/packages/react-aria-components/src/X.tsx |
| `SHAD:x` | https://github.com/shadcn-ui/ui/blob/bfa64ff/apps/v4/registry/new-york-v4/ui/x.tsx |
| `HUI:x` | https://github.com/tailwindlabs/headlessui/blob/eea57cf/packages/@headlessui-react/src/components/x/x.tsx |
| `MAT:x` | https://github.com/material-components/material-web/blob/a0bab1d/x (note: Material Web is in maintenance mode per its README; it implements Material 3 only for a subset of components) |
| `CAR:X` | https://github.com/carbon-design-system/carbon/blob/021b538/packages/react/src/components/X/X.tsx |
| `POL:X` | https://github.com/Shopify/polaris/blob/3f7954a/polaris-react/src/components/X/X.tsx |
| `PRI:X` | https://github.com/primer/react/blob/2128032/packages/react/src/X/X.tsx |

Claims marked "unverified" come from memory and were not checked against a primary source.

## Cross-cutting findings

- Touch target: MDN states "A minimum interactive size of 44x44 CSS pixels is recommended" and ties it to WCAG 2.5.5 (MDN:button, section "Size and Proximity"). Material Web enforces it in code: `.touch { height: max(48px, 100%) }` with a `touch-target` attribute of `wrapper`/`none` (MAT:button/internal/_touch-target.scss). shadcn's default Button is `h-9` (36px), `xs` is `h-6` and `icon` is `size-9` (SHAD:button), and its Input is `h-9` (SHAD:input), so a mobile-first default must add hit area on top of the library defaults. The WCAG 2.2 AA minimum (24px, SC 2.5.8) is from the WCAG spec, which was not fetched: unverified.
- Contrast: MDN cites 4.5:1 for normal text and 3:1 for large text (MDN:button, "Button styles"), and tells authors not to remove the focus ring and to use `:focus-visible`.
- Focus ring and render states: React Aria exposes `data-focus-visible`, `data-hovered`, `data-pressed`, `data-disabled`; Headless UI exposes focus/hover/active/disabled data attributes (RAC:Button, HUI:button). A consistent state vocabulary is: default, hover, pressed, focus-visible, disabled, plus control-specific (selected/checked/indeterminate, invalid, readonly, required, pending/loading, open/expanded).
- Auto-dismissing content: APG says alerts should not disappear automatically (APG:alert/alert-pattern.html). Defaults found: Carbon `timeout = 0` (no auto-dismiss, CAR:Notification), Radix 5000ms, Polaris 5000ms or 10000ms when the toast has an action (POL:Frame/components/Toast/Toast.tsx lines 17 and 19).
- Overlays on mobile: Polaris Modal has `size: small | large | fullScreen` (POL:Modal); Primer Dialog `position` accepts responsive `left | right | bottom | fullscreen | center` (PRI:Dialog).
- Hover-only information has no touch equivalent. APG describes tooltips as shown on focus or hover (APG:tooltip/tooltip-pattern.html); essential information should not live only in a tooltip (this is an inference, not a source claim).

## Summary table

"Agree" lists what APG, HTML and at least two libraries or design systems all show. "Split" is the main place sources diverge.

| Component | Agreed variants / props | Agreed a11y core | Main split |
|---|---|---|---|
| Button | emphasis levels (primary, secondary, tertiary/ghost, destructive); sizes; disabled; loading/pending | native `button`, Enter/Space, accessible name, `type` | disabled focusability; names of emphasis levels; no size scale agreement |
| Input | label, helper text, invalid/error, disabled, readonly, required | associated label, `aria-invalid`, `aria-describedby` | warn state (Carbon only); validation timing (aria vs native) |
| Checkbox | checked, indeterminate, disabled, invalid, required, name/value | role `checkbox`, Space, `aria-checked` mixed | indeterminate exposed as property only in HTML (not attribute) |
| Radio | group value, orientation, disabled, required | `radiogroup`, roving focus, arrows select | native vs APG initial focus; arrows check immediately except in toolbars |
| Select | value, open, disabled, required, invalid, placeholder | combobox/listbox or native select | native `select` vs custom listbox |
| Modal / dialog | open, title, description, close, sizes | `role=dialog`, `aria-modal`, labelled, focus trap and return, Esc | outside-click default; alertdialog handling |
| Tabs | value, orientation, disabled tab, activation mode | tablist/tab/tabpanel, arrows, `aria-selected` | auto vs manual activation; label |
| Card | slots: header, title, description, content, footer, action | none required by APG | no standard; clickable card semantics |
| Toast | status kinds, duration, action, dismiss | live region, no focus steal | `alert` vs `status`; default duration |
| Tooltip | placement, delay, label vs description | `role=tooltip`, `aria-describedby`, Esc, no focus | APG pattern has no consensus; delay values |
| Accordion | single vs multiple, collapsible, disabled | header button in heading, `aria-expanded`, `aria-controls` | `details/summary` name grouping vs ARIA; region role |
| Menu | open, items, checkable items, submenus | menu button, roving focus, type-ahead, Esc | menu vs plain disclosure for navigation |
| Table | caption, header scope, sort | native `table`, `th scope`, `aria-sort` | grid vs table for interaction |
| Pagination | current page, prev/next, labels | `nav` with label, `aria-current="page"` | numbered vs prev/next vs page-size model |
| Badge | tone/status set, size | text must carry meaning, not colour alone | tone names; progress variant (Polaris only) |
| Avatar | image, fallback, sizes, shape | alt text rules, fallback | size scale; image-loading status API |
| Form field | label, description, error, required, disabled, layout | label association, group/fieldset legend | where `disabled`/`required` live (field vs control) |

## Components

### Button
Variants (emphasis): shadcn `default, destructive, outline, secondary, ghost, link` (SHAD:button); Carbon `kind`: `primary, secondary, tertiary, ghost, danger, danger--primary, danger--ghost, danger--tertiary` (CAR:Button); Polaris `variant`: `primary, secondary, tertiary, plain, monochromePlain` and `tone`: `critical | success` (POL:Button); Primer `variant`: `default, primary, invisible, danger, link` (PRI:Button via `types.ts`); Material: elevated, filled, filled tonal, outlined, text buttons as separate components (MAT:button). Consensus: 3 to 4 emphasis levels (high, medium, low/ghost) plus a destructive one, expressed either as a variant value or as a separate `tone`. Names differ.
Sizes: shadcn `xs, sm, default, lg` plus icon sizes; Carbon `xs, sm, md, lg, xl, 2xl`; Polaris `micro, slim, medium, large`; Primer `small, medium, large`. No agreement on count or names.
Props: native `type` (`submit` default inside a form, `reset`, `button`), `disabled`, `name`, `value`, `form*`, `popovertarget`, `command` (MDN:button, Attributes section); `asChild` (shadcn, Radix Slot); `isPending`/`loading` (React Aria, Primer `loading` and `loadingAnnouncement`, Polaris `loading`); `fullWidth` (Polaris).
States: default, hover, pressed, focus-visible, disabled, pending (RAC:Button). React Aria pending "disables press and hover events while retaining focusability, and announces the pending state".
A11y: APG role `button`, Space and Enter activate, name from content/`aria-label`/`aria-labelledby`, `aria-pressed` for toggles with a label that does not change, `aria-haspopup`/`aria-expanded` for menu buttons (APG:button/button-pattern.html). MDN: use `aria-pressed`, not `aria-checked` or `aria-selected`, for button state; set `type="button"` for non-submit buttons; 44x44 target; proximity spacing; do not remove focus ring (MDN:button). Icon-only buttons need a name (MDN:button "Icon buttons"; Material docs say add `aria-label`, MAT:docs/components/button.md).
Disagreements: (1) Disabled and focus. APG says an unavailable action uses `aria-disabled="true"` (keeps it focusable); Material Web's default disabled button is not focusable and offers `soft-disabled` for focusable (MAT:docs/components/button.md "Focusable and disabled"); React Aria keeps focus during pending. Recommended default for the skill: native `disabled` for permanent unavailability, `aria-disabled` or pending-with-focus when the user needs to discover why (this recommendation is a judgement, not a source claim). (2) Emphasis names differ across all four design systems; the skill should map to the target project's names from `DESIGN.md`. (3) Size: 36px defaults in shadcn conflict with the 44px target.

### Input / text field
Variants: single-line, multiline (Polaris `multiline`, Carbon TextArea, native `textarea`), types by `type` attribute (MDN:input attribute table lists `autocomplete`, `disabled`, `maxlength`, `minlength`, `pattern`, `placeholder`, `readonly`, `required`, and more). Sizes: Carbon `xs, sm, md, lg` (CAR:TextInput); Material filled and outlined text fields (MAT:textfield).
Props consensus: `label` (Carbon `labelText` required; Polaris `label`, `labelHidden`), `helperText`/`helpText`, `invalid`/`error`, `disabled`, `readOnly`, `required`, `placeholder`, `value`/`defaultValue`, `name`, `autoComplete`, `inputMode`/`type`. Carbon alone has a `warn`/`warnText` state (CAR:TextInput); Carbon and Polaris add `inline`/prefix-suffix extras.
States: default, hover, focus, disabled, readonly, invalid, plus required (React Aria `isDisabled, isInvalid, isReadOnly, isRequired`, RAC:TextField; Headless UI `invalid`, HUI:input).
A11y: visible label associated with `for`/`id` or nesting (MDN:label recommends explicit `for`+`id`, optionally also nesting); placeholder is not a label substitute (MDN:input note under `placeholder`: "not as semantically useful as other ways to explain your form"); when using `pattern`, explain the format in nearby text (MDN:input); `aria-invalid` (shadcn styles `aria-invalid`, SHAD:input; Primer sets `aria-invalid` from `validationStatus === 'error'`, PRI:Checkbox); `autofocus` can cause scroll and pop the keyboard on touch devices (MDN:input autofocus note) which matters for mobile-first. APG has no text-input pattern.
Disagreements: validation timing: React Aria `validationBehavior: 'aria' | 'native'` (RAC types `@react-types/shared/src/inputs.d.ts`) versus Carbon/Polaris controlled `invalid`/`error` props. Default text size: shadcn Input uses `text-base` on mobile (SHAD:input), which avoids iOS zoom (the zoom behaviour itself is unverified).

### Checkbox
Variants: single checkbox, checkbox group, tri-state (APG:checkbox/checkbox-pattern.html); switch is a sibling (MDN:input/checkbox mentions a `switch` attribute exposing switch semantics).
Props: `checked`/`defaultChecked`/`onCheckedChange` (Radix), `indeterminate`, `disabled`, `required`, `name`, `value`, `form` (RDX:checkbox); React Aria `isSelected`, `isIndeterminate`, `isInvalid`, `isReadOnly`, `isRequired` (RAC:Checkbox); Headless UI `checked, defaultChecked, indeterminate, onChange` (HUI:checkbox); Polaris `checked: boolean | 'indeterminate'` (POL:Checkbox).
States: unchecked, checked, indeterminate, disabled, invalid, readonly, focus-visible, hover, pressed.
A11y: Space toggles; `aria-checked` true/false/mixed; group in `role=group` with `aria-labelledby` (APG). Native: `indeterminate` is an IDL property, not an attribute (HTML:L50161; MDN:input/checkbox "Indeterminate state checkboxes").
Disagreements: none on semantics. Parent/child "select all" behaviour is described in APG only. 44px target applies to the whole label row, not the 16px box (inference).

### Radio / radio group
Props: group `value`, `defaultValue`, `onValueChange`, `name`, `required`, `disabled`, `orientation`, `dir`, `loop` (RDX:radio-group); React Aria group states `isInvalid, isReadOnly, isRequired, isDisabled`, `data-orientation` (RAC:RadioGroup); Carbon RadioButtonGroup and RadioTile exist (component list at CAR); Headless UI RadioGroup (`value, defaultValue, onChange`, HUI:radio-group).
A11y: `radiogroup` with label, `radio` with `aria-checked`; Tab enters on the checked radio or the first; arrows move focus and check, wrapping; Space checks (APG:radio/radio-group-pattern.html).
Disagreements: APG notes that native radio groups differ (Shift+Tab into an unselected group may focus the last radio). In a toolbar, arrows move focus without checking (APG). Native grouping is by shared `name`; the spec source describes radio button groups under the input element (not cited by line here).

### Select
Variants: native `select`; custom listbox select; combobox with filtering is a separate pattern. Material filled/outlined (MAT:select).
Props: `value`, `defaultValue`, `onValueChange`/`onChange`, `open`, `onOpenChange`, `name`, `disabled`, `required`, `form`, `placeholder`, `size` (RDX:select; SHAD:select `size: default | sm`; RAC:Select states `isOpen, isInvalid, isRequired, isPlaceholder`).
A11y: APG select-only combobox: closed keys Down, Alt+Down, Enter, Space open; Home/End open and move; printable characters type ahead; DOM focus stays on the combobox with `aria-activedescendant`; roles `combobox` + `listbox` + `option`, `aria-expanded`, `aria-controls` (APG:combobox/examples/combobox-select-only.html, combobox-pattern.html). Radix renders trigger `role="combobox"` with `aria-autocomplete="none"` (RDX:select). 
Disagreements: native vs custom. shadcn ships both a custom `select` and a `native-select` (SHAD directory listing); Headless UI ships a native `Select` wrapper (HUI:select). Mobile-first default: prefer native select on touch (this is a recommendation; the sources only show both exist).

### Modal / dialog
Variants: modal dialog, alert dialog (confirmation requiring response), non-modal dialog, sheet/drawer (shadcn `sheet`, Polaris `Sheet`), full-screen on mobile (Polaris `fullScreen`, Primer `fullscreen`/`bottom`). Carbon Modal: `passiveModal`, `danger`, `size`, `preventCloseOnClickOutside` (CAR:Modal).
Props: `open`, `onOpenChange`/`onClose`, `modal`, title, description, close button (`showCloseButton` default true in shadcn with sr-only "Close", SHAD:dialog), `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside` (RDX:dialog), `role?: 'dialog' | 'alertdialog'` (HUI:dialog).
A11y: APG: role `dialog`/`alertdialog`, `aria-modal=true`, labelled by title, optional `aria-describedby`; focus moves inside on open, Tab wraps, Escape closes, focus returns to the invoker (or a logical element); a visible close button is strongly recommended; for irreversible actions focus the least destructive control (APG:dialog-modal/dialog-modal-pattern.html, APG:alertdialog/alertdialog-pattern.html). Native: `showModal()` makes the rest of the page inert; `autofocus` marks the initial focus target; `::backdrop` styles the backdrop (MDN:dialog).
Disagreements: (1) Outside click. HTML says a dialog opened with `showModal()` defaults to `closedby="closerequest"` (Esc only, no light dismiss) and `closedby="any"` adds outside clicks (HTML:L67112; MDN:dialog `closedby`), whereas Radix dismisses on outside pointer down by default with an `onPointerDownOutside` hook (RDX:dialog, DismissableLayer), React Aria makes it opt-in via `isDismissable` (RAC:Modal), and Carbon makes it opt-out via `preventCloseOnClickOutside` (CAR:Modal). (2) APG warns that `aria-modal` must only be set when outside content is truly inert and visually obscured (APG). (3) Radix only sets `aria-labelledby` when a Title is present (RDX:dialog), so a missing title silently drops the name; the review checklist should flag it.

### Tabs
Variants: horizontal/vertical orientation; Material primary and secondary tabs (MAT:tabs); shadcn list variants `default | line` (SHAD:tabs); Polaris Tabs and a legacy variant (POL directory listing).
Props: `value`, `defaultValue`, `onValueChange`, `orientation`, `dir`, `activationMode` (RDX:tabs); React Aria `keyboardActivation` (RAC:Tabs); per-tab `disabled`; Radix List `loop`.
A11y: `tablist`, `tab`, `tabpanel`; `aria-selected`, `aria-controls`, panel `aria-labelledby`; `aria-orientation=vertical` for vertical lists; arrow keys per orientation with wrap, optional Home/End; Tab moves from the active tab into the panel; panel gets `tabindex=0` when its first content is not focusable (APG:tabs/tabs-pattern.html). Material: add `aria-label` to `md-tabs` and to icon-only tabs (MAT:docs/components/tabs.md).
Disagreements: activation. APG recommends automatic activation when panels render without latency and allows manual; Radix defaults to `automatic` (RDX:tabs) and React Aria to `automatic` (RAC:Tabs): all agree on the default, but manual remains an option. For mobile, overflowing tab lists need horizontal scroll (inference).

### Card
No APG pattern, no Radix/React Aria/Headless UI primitive, and MDN has no card element.
Anatomy by implementation: shadcn Card = Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, all plain `div`s with no variants (SHAD:card); Polaris Card props `background`, `padding` (responsive), `roundedAbove` (POL:Card); Carbon Tile family: `Tile`, `ClickableTile`, `SelectableTile`, `ExpandableTile` (CAR:Tile); Primer Card exists as a component (directory listing at PRI).
Consensus: container + optional header/title/description/content/footer/action slots; interactive variants are clickable, selectable, expandable.
A11y: no source defines semantics. Rule of thumb for the skill (inference): a clickable card needs one real link or button as its primary target (stretched link) and nested interactive elements must stay separately focusable; Carbon's separate `ClickableTile` and `SelectableTile` components support treating "interactive card" as its own variant.

### Toast
Variants: kinds `error, info, info-square, success, warning, warning-alt` (CAR:Notification `kind`); Sonner `success, info, warning, error, loading` (SHAD:sonner); Radix `type: foreground | background` (RDX:toast); Polaris toast with optional `duration` and action, in Frame (POL:Frame/components/Toast/Toast.tsx; `duration` in `polaris-react/src/utilities/frame/types.ts`).
Props: `duration` (Radix 5000; Polaris 5000, 10000 with action; Carbon `timeout` default 0), action, dismiss (Carbon `hideCloseButton`), `swipeDirection`, `swipeThreshold` 50 (Radix), `label` "Notification", viewport hotkey F8.
A11y: APG alert = role `alert`, no keyboard interaction, must not take focus, avoid auto-disappearing content (APG:alert/alert-pattern.html). Radix renders `role="status"` with `aria-live` assertive for foreground and polite for background, noting `role=alert` causes screen-reader stuttering (RDX:toast); viewport is a labelled `region`. Carbon notifications default `role="status"` and accept `alert | log | status` (CAR:Notification). MDN: `status` is for advisory info not important enough for `alert` (MDN-ARIA:roles/status_role).
Disagreements: (1) `alert` (APG) vs `status` plus aria-live (Radix, Carbon default). (2) Default auto-dismiss: Carbon none, Radix and Polaris 5s: APG discourages auto-disappearing alerts, so toasts holding errors or actions should persist or pause on hover/focus. WCAG 2.2.1 timing details unverified. (3) Toasts with actions are hard for keyboard and screen-reader users to reach; Radix provides the F8 hotkey to jump to the viewport.

### Tooltip
Props: `delayDuration` default 700ms, `skipDelayDuration`, `disableHoverableContent` (RDX:tooltip); Primer `text`, `direction` (8 values), `type: 'label' | 'description'`, `delay: short (50ms) | medium (400ms) | long (1200ms)` (PRI:TooltipV2/Tooltip.tsx); Polaris `active`, `hoverDelay`, `preferredPosition`, `dismissOnMouseOut`, `persistOnClick` (POL:Tooltip); Carbon `enterDelayMs` default 100, `leaveDelayMs`, `closeOnActivation` (CAR:Tooltip).
A11y: APG role `tooltip`, trigger references it via `aria-describedby`, Esc dismisses, the tooltip never receives focus, shown on focus and hover (APG:tooltip/tooltip-pattern.html). Primer's `type` makes the label-versus-description distinction explicit. Polaris and Radix set `role="tooltip"` and `aria-describedby` (POL:Tooltip/components/TooltipOverlay, POL:Tooltip; RDX:tooltip).
Disagreements: (1) The APG tooltip pattern is marked work in progress with no task-force consensus (APG). (2) Delay defaults span 50ms to 700ms. (3) Hoverable content (WCAG 1.4.13, unverified) is handled differently: Radix `disableHoverableContent`, Polaris `dismissOnMouseOut`. Mobile: no hover; do not rely on tooltips for essential information.

### Accordion
Props: `type: 'single' | 'multiple'`, `value`/`defaultValue`, `collapsible`, `disabled`, `orientation` (RDX:accordion); React Aria Disclosure `isExpanded`, `isDisabled` (RAC:Disclosure); Carbon Accordion `align, isFlush, ordered, size: sm|md|lg, disabled` (CAR:Accordion). Native: `details` with `open` and a `name` attribute that makes members mutually exclusive (HTML:L66196; MDN:details).
A11y: header button inside a heading with a suitable `aria-level`; `aria-expanded`; `aria-controls`; Enter/Space toggle; Tab moves through all focusable elements; optional panel `role=region` with `aria-labelledby` (avoid with more than about 6 open panels); `aria-disabled=true` on an expanded header that cannot collapse (APG:accordion/accordion-pattern.html). Disclosure is the single-item version (APG:disclosure/disclosure-pattern.html).
Disagreements: native `details[name]` gives exclusive accordions without script, but the spec asks authors to consider whether exclusivity helps or harms users (HTML:L66196).

### Menu
Variants: menu button (action menu), context menu, menubar, navigation menu (Radix has `dropdown-menu`, `context-menu`, `menubar`, `navigation-menu`, package list at RDX); items: `menuitem`, `menuitemcheckbox`, `menuitemradio`, separators, submenus.
A11y: APG menu button: Enter/Space (optionally Down/Up) open and focus the first (Up: last) item; `aria-haspopup`, `aria-expanded`, optional `aria-controls` (APG:menu-button/menu-button-pattern.html). Menu: Up/Down wrap, Home/End, type-ahead, Enter activates and closes and refocuses the button, Escape closes and refocuses; `aria-checked` on checkable items, `aria-disabled` on disabled items (APG:menubar/menu-and-menubar-pattern.html, APG:menu-button/examples/menu-button-actions.html). Radix trigger has `aria-haspopup="menu"` (RDX dropdown-menu).
Disagreements: APG offers two focus strategies (roving tabindex vs `aria-activedescendant`). APG also shows a "navigation menu button" whose items are links; site navigation is often better served by a disclosure with a list of links (inference). Touch: menu items need 44px rows.

### Table
Variants: static table, sortable, selectable, expandable, interactive grid. Carbon DataTable, Polaris DataTable/IndexTable, Primer DataTable, React Aria Table (selection, sorting, resizing, drag states: RAC:Table), shadcn Table as thin wrappers over `table, thead, tbody, tfoot, tr, th, td, caption` (SHAD:table).
A11y: use native `table`; roles table/row/columnheader/rowheader/cell; label via `aria-labelledby`/`aria-label`; `aria-sort` on the sorted header; `aria-rowcount`/`aria-colcount`/indexes if rows or columns are not all in the DOM; table is not interactive and has no keyboard model: use grid for that (APG:table/table-pattern.html). Native: `caption`, `th scope="col|row"` (MDN:table).
Disagreements: none between APG and MDN. Mobile reflow (320px) is not addressed by any source read; the usual options are horizontal scroll in a labelled region or card reflow (inference).

### Pagination
No APG pattern and no Radix/React Aria primitive.
Models: shadcn numbered links in a `nav` with `aria-label="pagination"`, `aria-current="page"` on the active link, Previous/Next labelled "Go to previous page"/"Go to next page", ellipsis with sr-only "More pages" (SHAD:pagination); Primer numbered with `showPages`, `marginPageCount`, `surroundingPageCount`, `hrefBuilder`, `aria-label="Pagination"` and `aria-current` support (PRI:Pagination, model.tsx); Polaris previous/next only: `hasNext`, `hasPrevious`, `nextKeys`, `previousKeys`, `nextURL`, `label`, `type: 'page' | 'table'` (POL:Pagination); Carbon page-size selector plus page select: `page`, `pageSize`, `pageSizes`, `totalItems`, `pagesUnknown`, `size: xs|sm|md|lg` (CAR:Pagination).
A11y: MDN: set `aria-current="page"` on the link for the current page in a pagination set; only one element in a set is current; use `aria-selected`, not `aria-current`, for tabs (MDN-ARIA:attributes/aria-current).
Disagreements: numbered links (shadcn, Primer) vs prev/next (Polaris) vs page-size and page-select model (Carbon). Mobile-first default: prev/next plus "page X of Y" (an inference from Polaris' model; none of the sources says so).

### Badge / tag / label
Variants: shadcn `default, secondary, destructive, outline, ghost, link` (SHAD:badge); Polaris `tone`: `info, success, warning, critical, attention, new, magic`, `*-strong`, `read-only`, `enabled`, `progress: incomplete | partiallyComplete | complete`, `size`, and `toneAndProgressLabelOverride` for the accessible text (POL:Badge, types.ts); Carbon Tag `type`: `red, magenta, purple, blue, cyan, teal, green, gray, cool-gray, warm-gray, high-contrast, outline`, sizes `sm, md, lg` (CAR:Tag); Primer Label `variant`: `default, primary, secondary, accent, success, attention, severe, danger, done, sponsors`, `size: small | large` (PRI:Label) and CounterLabel `primary | secondary` (PRI:CounterLabel).
Consensus: a short non-interactive status/count label with a semantic tone set (neutral, info, success, warning, critical) and 2 to 3 sizes.
A11y: no APG or MDN pattern. Polaris computes an accessible label from tone and progress, which shows meaning must not rely on colour alone (POL:Badge). Disagreement: tone names and counts differ widely (3 to 10+); Carbon uses hue names, Polaris and Primer use meaning names. Prefer meaning names with an icon or text.

### Avatar
Props: Radix image load status `idle | loading | loaded | error`, `onLoadingStatusChange`, Fallback `delayMs` (RDX:avatar); shadcn `size: default | sm | lg` (32/24/40px per classes) plus AvatarBadge, AvatarGroup, AvatarGroupCount (SHAD:avatar); Polaris `size: xs | sm | md | lg | xl` (POL:Avatar); Primer numeric `size`, `square`, `alt` (PRI:Avatar); Carbon has `UserAvatar` (component list).
A11y: Primer's doc comment: provide `alt` when the avatar is used without the user's name next to it (default `alt=""`) (PRI:Avatar). No APG pattern. Fallback (initials or icon) shown while loading or on error.
Disagreements: size scale (3 steps vs 5 vs free-form number); shape circle default with `square` option (Primer). Initials fallback needs AA contrast (inference).

### Form field
Anatomy: label, control, description/help text, error text, required indicator, layout.
Props: shadcn Field `orientation: vertical | horizontal | responsive`, FieldLabel, FieldDescription, FieldSet + FieldLegend (`variant: legend | label`), FieldGroup, `role="group"` (SHAD:field); Headless UI Field, Fieldset, Label, Description, Legend (directory listing at HUI); React Aria Label, `Text slot="description"`, FieldError, Form (RAC:Form, RAC:FieldError); Primer FormControl takes `disabled`, `required`, `layout` and warns when `disabled`/`required` are passed to the input instead of the FormControl (PRI:FormControl); Carbon FormGroup/FormItem/FormLabel (component list); Polaris `Labelled`/`FormLayout` (component list).
A11y: label association by `for`/`id` or nesting; related controls grouped in `fieldset` + `legend`, which supports `disabled` (MDN:label, MDN:fieldset); `aria-describedby` for hint and error text and `aria-invalid` (MDN-ARIA:attributes/aria-describedby, aria-invalid exist; APG:checkbox, radio-group use `aria-describedby` for descriptions); required controls need a programmatic `required`.
Disagreements: where `disabled`/`required` live: on the field wrapper (Primer FormControl) vs on the control (Radix, React Aria, Headless UI). Error timing: native vs aria validation (React Aria `validationBehavior`).

## Consolidated disagreements

1. Toast live region: APG `alert` vs Radix `status` plus aria-live; default dismissal 0s (Carbon) vs 5s (Radix, Polaris).
2. Dialog outside click: HTML `showModal()` default Esc only; Radix on by default; React Aria opt-in; Carbon opt-out.
3. Disabled controls: APG `aria-disabled` (focusable) vs Material Web native disabled by default with `soft-disabled`.
4. Tooltip: APG pattern has no consensus; delays span 50ms to 700ms.
5. Pagination model: numbered, prev/next, or page-size select.
6. Variant names and size scales differ across all design systems and libraries; map them from `DESIGN.md`.
7. Touch target: MDN recommends 44x44 and Material enforces 48px, but shadcn defaults to 36px.
8. Where `disabled`/`required` live in form fields: wrapper vs control.
9. Native vs custom (select, accordion via `details[name]`, dialog via `<dialog>`): native elements give the baseline a11y for free; custom ARIA widgets add keyboard work.

## Gaps and limitations

- Not read: the published guideline pages for Material 3, Carbon, Polaris and Primer (blocked), so usage guidance, spacing and content rules are not covered. Radix, React Aria, shadcn and Headless UI docs sites were also blocked; their code was read instead, so documented-but-unimplemented behaviour would be missed.
- Not verified: WCAG 2.2 target-size minimum (24px), WCAG 1.4.13 hover content, WCAG 2.2.1 timing, and iOS input zoom behaviour; these are named only where marked "unverified" or "inference".
- Not read in depth: Carbon, Polaris and Primer table components, Headless UI Menu/Tabs/Disclosure/Tooltip props (path layout differed from the helper used), Radix Form and Label, the radio-group section of the HTML spec source, and APG Listbox/Link/Disclosure keyboard sections beyond the ARIA roles.
- Material Web is in maintenance mode and covers only a subset of Material 3 components (no card, badge, avatar, toast, tooltip, accordion, table or pagination in the repository at a0bab1d).
