# Component gallery survey (ticket #9)

Question: what does https://component.gallery add to the first-round component list, variants, props and states? Design system agnostic; intended as defaults for generated components and as a `review` checklist.

Method and caveats
- The gallery index (https://component.gallery/components/) and all 60 component pages (https://component.gallery/components/<slug>/) were fetched on 2026-11-22 and parsed. Counts below are computed from those pages.
- "Examples" is the gallery's own count (one link to a design system's page for that component; a design system can contribute more than one example, for instance Ant Design lists both `Button` and `FloatButton` under Button). "Design systems" is the number of distinct design-system names among a component page's examples. The design-systems page (https://component.gallery/design-systems/) lists 95 entries; 94 distinct names appear across the component pages.
- Gallery counts measure how widely a component is documented, not how widely it is used in products. They are a proxy for breadth of adoption.
- Priority tiers are this file's own heuristic on distinct design systems: A = 45 or more, B = 30 to 44, C = 15 to 29, D = under 15.
- Mapping of the first-round set onto gallery names (Input = Text input, Radio = Radio button, Modal/dialog = Modal, Menu = Dropdown menu) is my reading; the gallery lists "Menu" as an alias of both Navigation and Dropdown menu. "Form field" has no gallery page; Label, Fieldset and Form are the nearest (unverified mapping).
- Per-design-system variants, props and states are in the "Per-component findings" section; each bullet cites the page it came from. Anything not read from a fetched page is marked unverified.

## 1. Prioritised list of added components (not in the first-round set)

| Priority | Component (gallery page) | Gallery aliases | Examples | Design systems | Most common names used by design systems |
|---|---|---|---|---|---|
| A | [Alert](https://component.gallery/components/alert/) | Notification, Feedback, Message, Banner, Callout | 108 | 77 | Alert (30), Banner (16), Notification (8), Message (5) |
| A | [Spinner](https://component.gallery/components/spinner/) | Loader, Loading | 66 | 58 | Spinner (33), Loader (11), Loading (4), Spin (1) |
| A | [Toggle](https://component.gallery/components/toggle/) | Switch, Lightswitch, Toggle button | 60 | 58 | Switch (32), Toggle (19), Toggle Switch (2), Switch card (1) |
| A | [Link](https://component.gallery/components/link/) | Anchor, Hyperlink | 64 | 55 | Link (39), Text link (3), Anchor (2), Links (2) |
| A | [Breadcrumbs](https://component.gallery/components/breadcrumbs/) | Breadcrumb trail | 55 | 55 | Breadcrumbs (27), Breadcrumb (27), Breadcrumbs (You are here) (1) |
| A | [Textarea](https://component.gallery/components/textarea/) | Textbox, Text box | 52 | 52 | Textarea (37), Text area (7), Text Area (4), TextArea (3) |
| A | [Popover](https://component.gallery/components/popover/) | - | 50 | 48 | Popover (46), Popout (2), Popconfirm (1), Hovercard (1) |
| A | [List](https://component.gallery/components/list/) | - | 67 | 47 | List (32), Description list (5), Ordered list (2), Unordered list (2) |
| B | [Icon](https://component.gallery/components/icon/) | - | 45 | 43 | Icon (36), Service icons (1), SizedIcon (1), Icon tile (1) |
| B | [Navigation](https://component.gallery/components/navigation/) | Nav, Menu | 62 | 39 | Menu (7), Navigation (6), Navbar (4), Side navigation (3) |
| B | [Progress bar](https://component.gallery/components/progress-bar/) | Progress | 40 | 38 | Progress bar (16), Progress (11), Progress Bar (5), Linear progress (2) |
| B | [Slider](https://component.gallery/components/slider/) | Range input | 38 | 37 | Slider (23), Range (5), Range Input (2), RangeInput (2) |
| B | [Datepicker](https://component.gallery/components/datepicker/) | Calendar, Datetime picker | 44 | 36 | Date picker (12), Datepicker (10), Calendar (5), Date Picker (2) |
| B | [Combobox](https://component.gallery/components/combobox/) | Autocomplete, Autosuggest | 37 | 35 | Combobox (18), Autosuggest (4), Autocomplete (4), Combo box (3) |
| B | [Header](https://component.gallery/components/header/) | - | 38 | 34 | Header (15), Page header (3), Page Header (3), Masthead (2) |
| B | [Progress indicator](https://component.gallery/components/progress-indicator/) | Progress tracker, Stepper, Steps, Timeline, Meter | 38 | 34 | Stepper (9), Progress indicator (5), Steps (3), Timeline (3) |
| B | [Separator](https://component.gallery/components/separator/) | Divider, Horizonal rule, Vertical rule | 34 | 34 | Divider (19), Separator (9), Divider/Rule (1), Line (1) |
| B | [Drawer](https://component.gallery/components/drawer/) | Tray, Flyout, Sheet | 38 | 33 | Drawer (24), Panel (2), Flyout (2), BottomSheet (1) |
| B | [Button group](https://component.gallery/components/button-group/) | Toolbar | 35 | 32 | Button group (15), Button Group (7), ButtonGroup (2), Button Dock (1) |
| B | [Skeleton](https://component.gallery/components/skeleton/) | Skeleton loader | 30 | 30 | Skeleton (25), Skeleton loader (3), SkeletonLoader (1), Shimmer (1) |
| C | [Fieldset](https://component.gallery/components/fieldset/) | - | 32 | 29 | Fieldset (14), Form group (2), Input group (2), GroupBox (1) |
| C | [File upload](https://component.gallery/components/file-upload/) | File input, File uploader, Dropzone | 32 | 28 | Upload (3), File Uploader (3), File input (3), File upload (3) |
| C | [Segmented control](https://component.gallery/components/segmented-control/) | Toggle button group | 28 | 28 | Segmented control (5), Segmented Control (4), Toggle button (3), Switch (2) |
| C | [Search input](https://component.gallery/components/search-input/) | Search | 30 | 27 | Search (10), Search input (5), SearchField (2), Search bar (2) |
| C | [Heading](https://component.gallery/components/heading/) | - | 29 | 26 | Heading (20), Title (3), Section heading (2), Header (1) |
| C | [Image](https://component.gallery/components/image/) | Picture | 29 | 26 | Image (23), Picture (2), Img (2), Thumbnail (1) |
| C | [Carousel](https://component.gallery/components/carousel/) | Content slider | 22 | 21 | Carousel (18), Filmstrip (1), Content Slider (1), Banner Carousel (1) |
| C | [Form](https://component.gallery/components/form/) | - | 21 | 21 | Form (20), Example form (1) |
| C | [Stepper](https://component.gallery/components/stepper/) | Nudger, Quantity, Counter | 20 | 19 | Stepper (6), Number input (4), Quantity (2), Number field (2) |
| C | [Footer](https://component.gallery/components/footer/) | - | 19 | 18 | Footer (17), Page Footer (2) |
| C | [Rating](https://component.gallery/components/rating/) | - | 19 | 18 | Rating (11), Star rating (2), Rate (1), Ratings (1) |
| C | [Date input](https://component.gallery/components/date-input/) | - | 18 | 16 | Date input (9), Date (1), Datetime Local (1), DateField (1) |
| C | [Empty state](https://component.gallery/components/empty-state/) | - | 16 | 16 | Empty state (7), Empty State (5), Empty (1), Non-ideal state (1) |
| C | [Label](https://component.gallery/components/label/) | Form label | 15 | 15 | Label (11), Form label (2), Field Label (1), Field label (1) |
| C | [Video](https://component.gallery/components/video/) | Video player | 15 | 15 | Video (10), Video Player (2), Video player (1), Video embed (1) |
| D | [Skip link](https://component.gallery/components/skip-link/) | - | 14 | 14 | Skip link (5), Skiplink (2), Skip to content (2), Skip links (1) |
| D | [Tree view](https://component.gallery/components/tree-view/) | - | 14 | 14 | Tree view (6), Tree (5), TreeView (1), Tree View (1) |
| D | [Color picker](https://component.gallery/components/color-picker/) | - | 18 | 13 | Color picker (5), Color Picker (2), Color (1), Color palette picker (1) |
| D | [Quote](https://component.gallery/components/quote/) | Pull quote, Block quote | 11 | 11 | Blockquote (8), Quote (2), Testimonial (1) |
| D | [Visually hidden](https://component.gallery/components/visually-hidden/) | Screenreader only | 11 | 11 | Visually Hidden (3), Visually hidden (2), Screen Reader Only (2), VisuallyHidden (1) |
| D | [Stack](https://component.gallery/components/stack/) | - | 10 | 10 | Stack (10) |
| D | [Hero](https://component.gallery/components/hero/) | Jumbotron, Banner | 9 | 9 | Hero (6), Hero Area (1), Jumbotron (1), Masthead (1) |
| D | [File](https://component.gallery/components/file/) | Attachment, Download | 6 | 5 | Download (2), Related documents (1), File (1), Document list (1) |
| D | [Rich text editor](https://component.gallery/components/rich-text-editor/) | RTE, wysiwyg editor | 5 | 5 | Editor (2), Markdown editor (1), WYSIWYG (1), Rich Text Editor (1) |

## 2. Full gallery index (60 components)

Sorted by distinct design systems. Source: https://component.gallery/components/ and each component page.

| Component (gallery page) | Gallery aliases | Examples | Design systems | First-round counterpart |
|---|---|---|---|---|
| [Button](https://component.gallery/components/button/) | - | 118 | 85 | Button |
| [Checkbox](https://component.gallery/components/checkbox/) | - | 84 | 80 | Checkbox |
| [Radio button](https://component.gallery/components/radio-button/) | Radio, Radio group | 85 | 79 | Radio |
| [Alert](https://component.gallery/components/alert/) | Notification, Feedback, Message, Banner, Callout | 108 | 77 | - |
| [Accordion](https://component.gallery/components/accordion/) | Arrow toggle, Collapse, Collapsible sections, Collapsible, Details, Disclosure, Expandable, Expander, ShowyHideyThing | 101 | 74 | Accordion |
| [Tabs](https://component.gallery/components/tabs/) | Tabbed interface | 80 | 73 | Tabs |
| [Select](https://component.gallery/components/select/) | Dropdown, Select input | 82 | 72 | Select |
| [Text input](https://component.gallery/components/text-input/) | - | 72 | 72 | Input |
| [Badge](https://component.gallery/components/badge/) | Tag, Label, Chip | 123 | 66 | Badge |
| [Modal](https://component.gallery/components/modal/) | Dialog, Popup, Modal window | 82 | 66 | Modal/dialog |
| [Tooltip](https://component.gallery/components/tooltip/) | Toggletip | 74 | 66 | Tooltip |
| [Card](https://component.gallery/components/card/) | Tile | 77 | 65 | Card |
| [Table](https://component.gallery/components/table/) | - | 73 | 62 | Table |
| [Spinner](https://component.gallery/components/spinner/) | Loader, Loading | 66 | 58 | - |
| [Toggle](https://component.gallery/components/toggle/) | Switch, Lightswitch, Toggle button | 60 | 58 | - |
| [Breadcrumbs](https://component.gallery/components/breadcrumbs/) | Breadcrumb trail | 55 | 55 | - |
| [Link](https://component.gallery/components/link/) | Anchor, Hyperlink | 64 | 55 | - |
| [Textarea](https://component.gallery/components/textarea/) | Textbox, Text box | 52 | 52 | - |
| [Popover](https://component.gallery/components/popover/) | - | 50 | 48 | - |
| [List](https://component.gallery/components/list/) | - | 67 | 47 | - |
| [Pagination](https://component.gallery/components/pagination/) | - | 48 | 46 | Pagination |
| [Dropdown menu](https://component.gallery/components/dropdown-menu/) | Select menu | 49 | 44 | Menu |
| [Icon](https://component.gallery/components/icon/) | - | 45 | 43 | - |
| [Navigation](https://component.gallery/components/navigation/) | Nav, Menu | 62 | 39 | - |
| [Progress bar](https://component.gallery/components/progress-bar/) | Progress | 40 | 38 | - |
| [Slider](https://component.gallery/components/slider/) | Range input | 38 | 37 | - |
| [Datepicker](https://component.gallery/components/datepicker/) | Calendar, Datetime picker | 44 | 36 | - |
| [Toast](https://component.gallery/components/toast/) | Snackbar | 41 | 36 | Toast |
| [Avatar](https://component.gallery/components/avatar/) | - | 38 | 35 | Avatar |
| [Combobox](https://component.gallery/components/combobox/) | Autocomplete, Autosuggest | 37 | 35 | - |
| [Header](https://component.gallery/components/header/) | - | 38 | 34 | - |
| [Progress indicator](https://component.gallery/components/progress-indicator/) | Progress tracker, Stepper, Steps, Timeline, Meter | 38 | 34 | - |
| [Separator](https://component.gallery/components/separator/) | Divider, Horizonal rule, Vertical rule | 34 | 34 | - |
| [Drawer](https://component.gallery/components/drawer/) | Tray, Flyout, Sheet | 38 | 33 | - |
| [Button group](https://component.gallery/components/button-group/) | Toolbar | 35 | 32 | - |
| [Skeleton](https://component.gallery/components/skeleton/) | Skeleton loader | 30 | 30 | - |
| [Fieldset](https://component.gallery/components/fieldset/) | - | 32 | 29 | Form field (nearest, unverified mapping) |
| [File upload](https://component.gallery/components/file-upload/) | File input, File uploader, Dropzone | 32 | 28 | - |
| [Segmented control](https://component.gallery/components/segmented-control/) | Toggle button group | 28 | 28 | - |
| [Search input](https://component.gallery/components/search-input/) | Search | 30 | 27 | - |
| [Heading](https://component.gallery/components/heading/) | - | 29 | 26 | - |
| [Image](https://component.gallery/components/image/) | Picture | 29 | 26 | - |
| [Carousel](https://component.gallery/components/carousel/) | Content slider | 22 | 21 | - |
| [Form](https://component.gallery/components/form/) | - | 21 | 21 | Form field (nearest, unverified mapping) |
| [Stepper](https://component.gallery/components/stepper/) | Nudger, Quantity, Counter | 20 | 19 | - |
| [Footer](https://component.gallery/components/footer/) | - | 19 | 18 | - |
| [Rating](https://component.gallery/components/rating/) | - | 19 | 18 | - |
| [Date input](https://component.gallery/components/date-input/) | - | 18 | 16 | - |
| [Empty state](https://component.gallery/components/empty-state/) | - | 16 | 16 | - |
| [Label](https://component.gallery/components/label/) | Form label | 15 | 15 | Form field (nearest, unverified mapping) |
| [Video](https://component.gallery/components/video/) | Video player | 15 | 15 | - |
| [Skip link](https://component.gallery/components/skip-link/) | - | 14 | 14 | - |
| [Tree view](https://component.gallery/components/tree-view/) | - | 14 | 14 | - |
| [Color picker](https://component.gallery/components/color-picker/) | - | 18 | 13 | - |
| [Quote](https://component.gallery/components/quote/) | Pull quote, Block quote | 11 | 11 | - |
| [Visually hidden](https://component.gallery/components/visually-hidden/) | Screenreader only | 11 | 11 | - |
| [Stack](https://component.gallery/components/stack/) | - | 10 | 10 | - |
| [Hero](https://component.gallery/components/hero/) | Jumbotron, Banner | 9 | 9 | - |
| [File](https://component.gallery/components/file/) | Attachment, Download | 6 | 5 | - |
| [Rich text editor](https://component.gallery/components/rich-text-editor/) | RTE, wysiwyg editor | 5 | 5 | - |

## 3. Per-component findings

Each bullet names the design system, what the page documents, and the page URL it was read from. Values in quotes are copied from the fetched page (prop tables, code samples or headings). "Not read" means no page for that system was fetched for that component. Design systems read: Chakra UI, Ant Design, Primer, shadcn/ui, Radix Primitives, React Aria, Bootstrap 4.3 (the version the gallery links), GOV.UK Design System, Atlassian Design System, Headless UI. Gallery pages for Material Design, Spectrum, Carbon, Ariakit, Polaris, Fluent UI, Lightning and Pajamas could not be read (see section 6).

### 3.1 Alert (gallery: Alert, 77 design systems; added, tier A)

- Naming: the gallery's own aliases are Notification, Feedback, Message, Banner, Callout. Design systems call the page Alert (30), Banner (16), Notification (8), Message (5), Callout (4), Inline message (3), Section message (2), Notice (2) (https://component.gallery/components/alert/). Several systems split one concept into several components: Ant Design has Alert, Message and Notification; Atlassian has Banner, Section message, Flag and Inline message; Pajamas has Alert, Banner and Broadcast message (same gallery page).
- Chakra UI Alert: props `status` ('info' | 'warning' | 'success' | 'error' | 'neutral', default 'info'), `variant` ('subtle' | 'surface' | 'outline' | 'solid', default 'subtle'), `size` ('sm' | 'md' | 'lg', default 'md'), `colorPalette`, `inline`; documented examples: With Close Button, With Spinner, Custom Icon (`icon` prop overrides the status icon). https://chakra-ui.com/docs/components/alert
- Ant Design Alert: `type` ("success, info, warning, error", default info; "in banner mode default is warning"), `variant` ('outlined' | 'filled'), `banner`, `showIcon`, `icon`, `title`, `description`, `closable` (boolean or config with `closeIcon`, `afterClose`), `onClose`, `action`. https://ant.design/components/alert
- Primer Banner: `variant` ('critical' | 'info' | 'success' | 'upsell' | 'warning'), `title`, `description`, `hideTitle`, `onDismiss` (providing it shows a dismiss button), `primaryAction`, `secondaryAction`, `actionsLayout` ('default' | 'inline' | 'stacked'), `layout` ('default' | 'compact'), `flush` (full width banner for confined spaces such as dialogs, tables, cards), `leadingVisual`/`icon` (only for variant info or upsell). https://primer.style/design/components/banner
- Atlassian Section message: `appearance` values shown: information (default), warning, success, error, discovery; optional `title` and `actions`; "all section message come with an icon and an area for content". https://atlassian.design/components/section-message/examples
- shadcn/ui Alert: composition Alert, AlertTitle, AlertDescription, AlertAction, optional icon; prop table lists only `variant` "default" | "destructive". https://ui.shadcn.com/docs/components/alert
- Bootstrap 4.3 Alerts: eight contextual classes (.alert-primary, -secondary, -success, -danger, -warning, -info, -light, -dark), `role="alert"`, optional dismiss button, `.alert-link` for links inside. https://getbootstrap.com/docs/4.3/components/alerts/
- GOV.UK Warning text is a smaller pattern: a `govuk-warning-text` block, no severity variants shown in what I extracted. https://design-system.service.gov.uk/components/warning-text/
- Variant-set disagreement: severity names differ (Bootstrap "danger", Chakra/Ant "error", shadcn "destructive", Primer "critical", Atlassian "error" plus "discovery", Primer "upsell"). The shared core across Chakra, Ant, Primer and Atlassian is info, success, warning, error (critical in Primer); extras are neutral (Chakra), discovery (Atlassian), upsell (Primer). Visual style is a second axis in Chakra (4 values) and Ant (2 values), absent in Primer, Atlassian and shadcn.
- Presentation options that recur: dismissible/closable (Chakra close button example, Ant `closable`, Primer `onDismiss`, Bootstrap dismiss), actions (Ant `action`, Primer primary/secondary, Atlassian `actions`), custom icon (Chakra, Ant, Primer), title plus description (Ant, Primer, Atlassian).

### 3.2 Spinner (66 examples, 58 design systems; added, tier A)

- Naming: Spinner (33), Loader (11), Loading (4), Spin, Inline loading, Progress Circle (https://component.gallery/components/spinner/). Ant Design's component is Spin; Chakra's Progress Circle is also listed as a spinner example.
- Chakra UI Spinner: `size` 'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default 'md'); sections Sizes, Colors, Custom Color, Track Color, Custom Speed, Thickness, Custom Indicator, Label, Overlay. https://chakra-ui.com/docs/components/spinner
- Ant Design Spin: `size` small | medium | large; `spinning`; `delay` ("prevent flush"); `fullscreen` (backdrop); `indicator`; `percent` (number or 'auto' for indeterminate); `description` (6.3.0). https://ant.design/components/spin
- Primer Spinner: `size` 'small' | 'medium' | 'large'; `srText` (string or null); `delay` (boolean | 'short' | 'long' | number). https://primer.style/design/components/spinner
- Bootstrap 4.3 Spinner: two types, `.spinner-border` and `.spinner-grow`; colours via text utilities; small size variant; each includes `role="status"` and a nested `<span class="sr-only">Loading...</span>`. https://getbootstrap.com/docs/4.3/components/spinners/
- Agreement: size scale; an accessible label (Primer `srText`, Bootstrap sr-only text, Chakra Label example). Disagreement: delay before showing exists in Ant and Primer only; Chakra size has 6 steps, Primer 3, Ant 3.

### 3.3 Toggle / Switch (60 examples, 58 design systems; added, tier A)

- Naming: Switch (32), Toggle (19), Toggle Switch (2) (https://component.gallery/components/toggle/). Gallery aliases include Lightswitch and Toggle button. Primer names its component "Toggle switch" and Material Design, Ant, Chakra, Headless UI, Radix, shadcn, Polaris and Spectrum use "Switch" (same gallery page).
- Radix Primitives Switch: Root props `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, `required`, `name`, `value`; data attributes `[data-state]` "checked" | "unchecked" and `[data-disabled]`; a hidden input renders in forms; parts Root and Thumb. https://radix-ui.com/primitives/docs/components/switch
- React Aria Switch: props `isSelected`, `defaultSelected`, `isDisabled`, `isReadOnly`, `isRequired`, `name`, `value`; render states hovered, pressed, focused, focus-visible, selected, disabled, read-only, invalid, required (CSS selectors `[data-selected]`, `[data-disabled]`, and so on). https://react-aria.adobe.com/Switch
- Ant Design Switch: `checked`, `defaultChecked`, `disabled`, `loading`, `size` 'medium' | 'small', `checkedChildren`, `unCheckedChildren`. https://ant.design/components/switch
- Primer ToggleSwitch: `checked`, `defaultChecked`, `disabled`, `loading`, `size` 'small' | 'medium', `statusLabelPosition` 'start' | 'end', `loadingLabelDelay` (2000), `buttonLabelOn`/`buttonLabelOff` ('On'/'Off'). Examples: default, caption, custom size. https://primer.style/design/components/toggle-switch
- States seen in more than one system: checked/unchecked, disabled (Radix, React Aria, Ant, Primer), loading (Ant, Primer), read-only and invalid (React Aria only). Variant sets are small: size small/medium (Ant, Primer) and optional on/off labels (Ant children, Primer status labels).

### 3.4 Link (64 examples, 55 design systems; added, tier A)

- Naming: Link (39), Text link (3), Anchor (2), Links (2), Hyperlink (https://component.gallery/components/link/).
- Chakra UI Link: `variant` 'underline' | 'plain' (default 'plain'), `colorPalette`. https://chakra-ui.com/docs/components/link
- Primer Link: `href`, `muted` (false), `inline` (false), `hoverColor`, `as`. https://primer.style/design/components/link
- Variant-set disagreement: the only documented variants are underline vs plain (Chakra) and muted/inline flags (Primer). Not read: Carbon, Spectrum, Polaris, Fluent, Base Web, Pajamas link pages.

### 3.5 Breadcrumbs (55 examples, 55 design systems; added, tier A)

- Naming: Breadcrumbs (27) and Breadcrumb (27), an even split (https://component.gallery/components/breadcrumbs/).
- Chakra UI: `variant` 'underline' | 'plain', `size` 'sm' | 'md' | 'lg'; anatomy list, item, link, currentLink, separator, ellipsis. https://chakra-ui.com/docs/components/breadcrumb
- Ant Design: `items` (each with `title`, `href` or `path`, `menu`, `dropdownProps`, `onClick`), `separator` (default "/"), separator items, `itemRender`, `params`. https://ant.design/components/breadcrumb
- React Aria Breadcrumbs: items expose `isCurrent` ([data-current]) and `isDisabled` ([data-disabled]). https://react-aria.adobe.com/Breadcrumbs
- GOV.UK: `<nav class="govuk-breadcrumbs" aria-label="Breadcrumb">` containing an `<ol class="govuk-breadcrumbs__list">`. https://design-system.service.gov.uk/components/breadcrumbs/
- Bootstrap 4.3: `<nav aria-label="breadcrumb">` with `.breadcrumb-item`, and `.active` plus `aria-current="page"` on the last item. https://getbootstrap.com/docs/4.3/components/breadcrumb/
- Agreement: landmark `nav` with a label and a marker on the current page (aria-current or isCurrent). Optional: custom separator (Ant, Chakra), collapse/ellipsis (Chakra anatomy), overflow menu on an item (Ant `menu`).

### 3.6 Textarea (52 examples, 52 design systems; added, tier A)

- Naming: Textarea (37), Text area (7), Text Area (4), TextArea (3) (https://component.gallery/components/textarea/).
- Chakra UI: `size` 'xs' | 'sm' | 'md' | 'lg' | 'xl', `variant` 'outline' | 'subtle' | 'flushed'; sections Sizes, Variants, Error Text. https://chakra-ui.com/docs/components/textarea
- Primer: `rows`, `cols`, `block`, `resize` ('both' | 'horizontal' | 'vertical' | 'none'), `autoSize`, `minHeight`, `maxHeight`, `characterLimit`, `contrast`, `validationStatus` ('success' | 'error'), `required`. https://primer.style/design/components/textarea
- GOV.UK: `<textarea class="govuk-textarea" rows="5" aria-describedby="...-hint">` with a label and hint; "You must label textareas. Placeholder text is not a suitable substitute for a label". https://design-system.service.gov.uk/components/textarea/
- React Aria TextField (covers single and multi-line text fields): states disabled, invalid, read-only, required. https://react-aria.adobe.com/TextField
- Shared concerns: resize behaviour (Primer), auto-grow (Primer `autoSize`), character limit (Primer, GOV.UK has a separate Character count component per its menu; its page was not read), validation status (Primer, React Aria).

### 3.7 Popover (50 examples, 48 design systems; added, tier A)

- Naming: Popover (46), Popout (2), Popconfirm, Hovercard. Gallery treats Toggletip as an alias of Tooltip, not of Popover (https://component.gallery/components/popover/, https://component.gallery/components/tooltip/).
- Radix Primitives: Root `open`, `defaultOpen`, `onOpenChange`, `modal` (false); Content `side` ("bottom"), `sideOffset`, `align` ("center"), `alignOffset`, `avoidCollisions` (true), `collisionPadding`, `sticky`, `hideWhenDetached`, `onEscapeKeyDown`, `onPointerDownOutside`, `onInteractOutside`, `forceMount`; parts Trigger, Anchor, Portal, Content; `[data-state]` "open" | "closed". https://radix-ui.com/primitives/docs/components/popover
- Chakra UI: `closeOnEscape` (true), `closeOnInteractOutside` (true), `autoFocus` (true), `restoreFocus` (true), `portalled` (true), `size` 'xs' | 'sm' | 'md' | 'lg'; sections Controlled, Placement, Sizes. https://chakra-ui.com/docs/components/popover
- Ant Design: Popover with `title`, `content`, `trigger` (hover | focus | click | contextMenu, default hover), `placement` (12 positions), `open`, `arrow`, `autoAdjustOverflow`, `mouseEnterDelay`; shares its API with Tooltip and Popconfirm. https://ant.design/components/popover
- Primer: `open`, `caret` (12 positions), `width` ('xsmall' to 'xlarge' | 'auto'), `height`, `overflow`, `onClickOutside`, `onEscape`. https://primer.style/design/components/popover
- React Aria Popover: states entering, exiting, `placement` ([data-placement]) and trigger. https://react-aria.adobe.com/Popover
- Disagreement on scope: Ant folds a confirm variant (Popconfirm) into the same family; Radix treats modal vs non-modal as a boolean; Primer's popover is a caret-bearing callout with explicit width presets.

### 3.8 Progress bar (40 examples, 38 design systems; added, tier B)

- Naming: Progress bar (16), Progress (11), Linear progress (2); Chakra's "Progress Circle" is listed under Spinner, not here (https://component.gallery/components/progress-bar/).
- Chakra UI Progress: `variant` 'outline' | 'subtle', `shape` 'square' | 'rounded' | 'full', `size` 'xs' to 'xl', `orientation` 'horizontal' | 'vertical', `min` 0, `max` 100, `value`/`defaultValue`, `formatOptions`; sections Indeterminate, Colors, Sizes, Variants. https://chakra-ui.com/docs/components/progress
- Ant Design Progress: `type` line | circle | dashboard; `status` success | exception | normal | active; `percent`, `showInfo`, `format`, `strokeColor`, `railColor`, `size`, `steps`. https://ant.design/components/progress
- Radix Progress: Root `value` (number or null), `max`, `getValueLabel`; `[data-state]` "complete" | "indeterminate" | "loading". https://radix-ui.com/primitives/docs/components/progress
- Primer ProgressBar: `progress`, `barSize` 'small' | 'large' | 'default', `animated`, `inline`. https://primer.style/design/components/progress-bar
- Bootstrap 4.3: `.progress-bar` inside `.progress`, `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`; options height, striped, animated stripes, stacked bars. https://getbootstrap.com/docs/4.3/components/progress/
- React Aria ProgressBar: indeterminate is `:not([aria-valuenow])`; `valueText` maps to aria-valuetext. https://react-aria.adobe.com/ProgressBar
- Agreement: determinate vs indeterminate and an accessible value. Disagreement: Ant folds circular and dashboard shapes into the same component; Chakra splits Progress Circle out; Ant has an explicit status (exception/success), others derive it from colour or state.

### 3.9 Slider (38 examples, 37 design systems; added, tier B)

- Naming: Slider (23), Range (5), Range Input (2), Range slider (2) (https://component.gallery/components/slider/).
- Radix Slider: `value`/`defaultValue` as number[] (multi-thumb), `min` 0, `max` 100, `step` 1, `minStepsBetweenThumbs`, `orientation`, `inverted`, `disabled`, `onValueChange`, `onValueCommit`. https://radix-ui.com/primitives/docs/components/slider
- Chakra UI: `orientation`, `origin` ('start' | 'center' | 'end'), `step`, `largeStep` (Shift or PageUp/PageDown), `thumbAlignment`, `thumbCollisionBehavior` ('none' | 'push' | 'swap'); sections Controlled, Disabled, Sizes, Variants, Vertical, Vertical with Marks. https://chakra-ui.com/docs/components/slider
- Ant Design: `range` (dual thumb), `marks`, `dots`, `included`, `reverse`, `vertical`/`orientation`, `tooltip`, `keyboard`, `disabled` (also an array for per-handle disabling), `onChangeComplete`. https://ant.design/components/slider
- React Aria Slider: states disabled, dragging, hovered, focused, focus-visible; orientation attribute. https://react-aria.adobe.com/Slider
- Shared: single vs range selection, orientation, step with keyboard larger step (Chakra), tick marks (Chakra, Ant). The "Range" alias in Atlassian and the HTML `range` input explain why "Range" and "Slider" both appear.

### 3.10 Date picker (44 examples, 36 design systems; added, tier B)

- Naming: Date picker (12), Datepicker (10), Calendar (5), Date Picker (2), DatePicker (2); the gallery also keeps a separate "Date input" page (18 examples, 16 design systems) for typed date entry (https://component.gallery/components/datepicker/, https://component.gallery/components/date-input/).
- Ant Design DatePicker: `picker` (date | week | month | quarter | year), `showTime`, `format`, `presets`, `minDate`/`maxDate`, `disabledDate`, `disabledTime`, `multiple`, `needConfirm`, `status` ('error' | 'warning'), `variant` (outlined | borderless | filled | underlined), `size`, `placement` (4 values), `showNow`, `allowClear`. https://ant.design/components/date-picker
- React Aria DatePicker: `granularity`, `hourCycle` (12 | 24), `isDateUnavailable`, `placeholderValue`, `shouldForceLeadingZeros`, `hideTimeZone`, `firstDayOfWeek`; states open, invalid, disabled, read-only, required, focus-within. https://react-aria.adobe.com/DatePicker
- shadcn/ui documents this as Calendar (name disagreement with "Date picker"): https://ui.shadcn.com/docs/components/calendar (page fetched; props not read).
- Disagreement: whether range selection, time selection and week/month/year modes belong in one component (Ant) or in separate ones (React Aria has DateField, DatePicker, DateRangePicker and Calendar as separate pages, unverified count).

### 3.11 Combobox (37 examples, 35 design systems; added, tier B)

- Naming: Combobox (18), Autosuggest (4), Autocomplete (4), Combo box (3), Typeahead, Dropdown (https://component.gallery/components/combobox/). Ant calls it Auto complete; Primer calls it Autocomplete; Lightning has Combobox, Lookup and Picklist.
- Primer Autocomplete: `openOnFocus`, `filterFn`, `loading`, `selectionVariant` ('single' | 'multiple'), `addNewItem`, `emptyStateText`, `sortOnCloseFn`, `onOpenChange`, `onSelectedChange`. https://primer.style/design/components/autocomplete
- React Aria ComboBox: `allowsCustomValue`, `allowsEmptyCollection`, `menuTrigger` (default 'input'), `defaultFilter`, `inputValue`, `items`; states open, disabled, invalid, read-only, required. https://react-aria.adobe.com/ComboBox
- Headless UI Combobox: `data-open`, `data-focus`, `data-selected` states on options; `Field disabled` disables the combobox and its label and description; `anchor` for popup position. https://headlessui.com/react/combobox
- Disagreement: whether free-text values are allowed (React Aria `allowsCustomValue`, Primer `addNewItem`) and single vs multiple selection (Primer `selectionVariant`).

### 3.12 Progress indicator / Stepper (38 examples, 34 design systems; added, tier B)

- Naming: Stepper (9), Progress indicator (5), Steps (3), Timeline (3), Progress stepper (3), Progress tracker (2) (https://component.gallery/components/progress-indicator/). The gallery also has a separate "Stepper" page (20 examples) for the number-input meaning (Nudger, Quantity, Counter), a direct homonym clash (https://component.gallery/components/stepper/).
- Ant Design Steps: `current`, `status` (wait | process | finish | error), `type` (default | dot | inline | navigation | panel), `direction`/`orientation`, `titlePlacement`, `size`, `variant` (filled | outlined), `percent`, `maxCount`, `onChange`, `items`. https://ant.design/components/steps
- Chakra UI Steps: `variant` 'solid' | 'subtle', `size` 'xs' to 'lg', `orientation`, `count`, `linear`, `defaultStep`, `isStepValid`, `isStepSkippable`, `onStepChange`; sections Colors, Controlled, Sizes, Vertical. https://chakra-ui.com/docs/components/steps
- Variant-set disagreement: Ant has five layout types (default, dot, inline, navigation, panel) and four step statuses; Chakra models linear/non-linear navigation and step validity instead of statuses.

### 3.13 Separator / Divider (34 examples, 34 design systems; added, tier B)

- Naming: Divider (19), Separator (9), Divider/Rule, Line, Horizontal rule (https://component.gallery/components/separator/). Radix, Ariakit, Chakra, Fluent and shadcn use Separator; Ant, Material, Polaris, Spectrum use Divider (same page).
- Radix: `orientation` ("horizontal"), `decorative` (boolean); "Adheres to the separator role requirements". https://radix-ui.com/primitives/docs/components/separator
- Chakra: `variant` 'solid' | 'dashed' | 'dotted', `orientation`, `size` 'xs' to 'lg'. https://chakra-ui.com/docs/components/separator
- Ant: `variant` dashed | dotted | solid, `orientation` or `vertical`, `titlePlacement` (start | end | center), `plain`, `size`. https://ant.design/components/divider
- Key distinction: decorative vs semantic (Radix `decorative`). Only Ant supports a labelled divider (title text).

### 3.14 Drawer (38 examples, 33 design systems; added, tier B)

- Naming: Drawer (24), Panel (2), Flyout (2), Bottom sheet, Side sheet, Tray, Sheet; shadcn has both Drawer and Sheet pages; Material has "Side sheet", Spectrum "Tray" (https://component.gallery/components/drawer/).
- Chakra UI Drawer: `placement` 'start' | 'end' | 'top' | 'bottom' (default 'end'), `size` 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full', `role` 'dialog' | 'alertdialog', `modal`, `trapFocus`, `closeOnEscape`, `closeOnInteractOutside`, `preventScroll`, `lazyMount`. https://chakra-ui.com/docs/components/drawer
- Ant Design Drawer: `placement` top | right | bottom | left, `size` 'default' (378px) | 'large' (736px) | number, `mask`, `maskClosable`, `closable`, `keyboard`, `push` (nested drawers), `resizable`, `loading` (shows a Skeleton), `extra`, `footer`, `focusable`. https://ant.design/components/drawer
- Pattern: drawer is a dialog variant anchored to an edge (Chakra exposes the dialog role); logical placements start/end (Chakra) vs physical left/right (Ant).

### 3.15 Button group (35 examples, 32 design systems; added, tier B)

- Naming: Button group (15), Button Group (7), ButtonGroup (2), Button Dock, CommandBar, Button set (https://component.gallery/components/button-group/). The gallery lists Toolbar as an alias; Spectrum has both Action group and Button group, Primer has Action bar and Button group, shadcn has Toggle Group.
- Bootstrap 4.3: `.btn-group` wrapping `.btn`; sizing, vertical variation (`.btn-group-vertical`), and `.btn-toolbar` for combining groups; `role="group"` or `role="toolbar"` with an explicit label via aria-label. https://getbootstrap.com/docs/4.3/components/button-group/
- Primer ButtonGroup: page fetched; its props table listed only `ref`. https://primer.style/design/components/button-group
- Disagreement: whether grouping is purely visual (Bootstrap, Primer) or carries selection semantics (shadcn Toggle Group, gallery's Segmented control page).

### 3.16 Skeleton (30 examples, 30 design systems; added, tier B)

- Naming: Skeleton (25), Skeleton loader (3), Shimmer (Fluent) (https://component.gallery/components/skeleton/).
- Chakra UI: `variant` 'pulse' | 'shine' | 'none' (default 'pulse'), `loading` (default true). https://chakra-ui.com/docs/components/skeleton
- Ant Design: `active` (animation), `avatar`, `title`, `paragraph` (`rows`, `width`), `round`, `loading`; sub-components Skeleton.Avatar (`shape` circle | square, `size`), Skeleton.Button (`shape`, `block`, `size`), Skeleton.Input (`size`). https://ant.design/components/skeleton
- Agreement: animation on/off. Disagreement: Chakra wraps arbitrary content and toggles `loading`; Ant offers content-shaped presets (avatar, title, paragraph).

### 3.17 Components with gallery data only (no design-system page read)

| Component | Notes from the gallery (https://component.gallery/components/<slug>/) |
|---|---|
| List (47 ds) | Names: List (32), Description list (5), Ordered list, Unordered list. Ant splits List and Description list; Polaris has Ordered list and Unordered list; Primer has Action list. |
| Icon (43 ds) | Names: Icon (36). Gallery treats Icon as its own component page; pages not read. |
| Navigation (39 ds) | Names: Menu (7), Navigation (6), Navbar (4), Side navigation (3), Bottom Navigation. Gallery aliases Nav and Menu. Systems split it by position (top bar, side, bottom, rail). |
| Header (34 ds) | Names: Header (15), Page header, Masthead, Navbar, Top app bar. Overlaps with Navigation. |
| Fieldset (29 ds), Label (15), Form (21) | Candidates for the first-round "Form field" (mapping unverified). Fieldset alternates: Form group, Input group, GroupBox, ChoiceGroup. |
| File upload (28 ds), Search input (27), Segmented control (28), Heading (26), Image (26), Carousel (21), Stepper/number input (19), Footer (18), Rating (18), Date input (16), Empty state (16), Video (15) | Naming spread is in section 2 and in the gallery pages. Variant, prop and state data not collected. |
| Skip link, Tree view, Color picker, Quote, Visually hidden, Stack, Hero, File, Rich text editor (tier D) | 5 to 14 design systems each; names only. |

## 4. First-round components: what the gallery and the linked systems add

Names used by design systems for the first-round components (counts are example pages from each component page; source is the gallery page listed). This is where aliases disagree most.

| First-round | Gallery page | Names used (count) |
|---|---|---|
| Button | https://component.gallery/components/button/ | Button (84), IconButton (4), Icon button (4), Floating action button (2), CloseButton (2), FloatButton (1) |
| Input | https://component.gallery/components/text-input/ | Input (26), Text input (18), Text field (6), Input field (4), TextField (3), TextInput (3) |
| Checkbox | https://component.gallery/components/checkbox/ | Checkbox (69), Checkboxes (9), Checkbox card (2) |
| Radio | https://component.gallery/components/radio-button/ | Radio (33), Radio button (20), Radios (5), Radio group (11 across spellings), Radio card (2) |
| Select | https://component.gallery/components/select/ | Select (56), Dropdown (9), Select list, Native select |
| Modal/dialog | https://component.gallery/components/modal/ | Modal (42), Dialog (25), Alert Dialog (4), Modal dialog, Confirm Dialog |
| Tabs | https://component.gallery/components/tabs/ | Tabs (59), Tab (9), Tab Group (4), Pivot |
| Card | https://component.gallery/components/card/ | Card (53), Content card (4), Tile (4), Product card (3) |
| Toast | https://component.gallery/components/toast/ | Toast (28), Snackbar (5), Toaster, Notification |
| Tooltip | https://component.gallery/components/tooltip/ | Tooltip (63), Toggletip (2), Hover Card, Infotip, Signpost |
| Accordion | https://component.gallery/components/accordion/ | Accordion (51), Details (9), Disclosure (7), Collapse (5), Collapsible (4), Expander (3) |
| Menu | https://component.gallery/components/dropdown-menu/ | Dropdown (17), Menu (11), Dropdown menu (5), Listbox (2), Overflow menu |
| Table | https://component.gallery/components/table/ | Table (52), Data table (10 across spellings) |
| Pagination | https://component.gallery/components/pagination/ | Pagination (45) |
| Badge | https://component.gallery/components/badge/ | Badge (45), Tag (32), Chip (8), Pill (7), Label (5), Lozenge, Status |
| Avatar | https://component.gallery/components/avatar/ | Avatar (35), AvatarGroup, Avatar stack |

Additions to variants, props and states from the systems read (first-round components only):

- Button, Chakra UI: `variant` 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain'; `size` '2xs' to '2xl'; `loading`, `loadingText`; sections Disabled, Disabled Link, Loading. https://chakra-ui.com/docs/components/button
- Badge, Chakra UI: `variant` 'solid' | 'subtle' | 'outline' | 'surface' | 'plain'; `size` 'xs' | 'sm' | 'md' | 'lg'. https://chakra-ui.com/docs/components/badge
- Avatar, Chakra UI: `variant` 'solid' | 'subtle' | 'outline'; `shape` 'square' | 'rounded' | 'full'; `size` 'full' and '2xs' to '2xl'. https://chakra-ui.com/docs/components/avatar
- Modal/dialog, Chakra UI: `role` 'dialog' | 'alertdialog'; `placement` 'center' | 'top' | 'bottom'; `size` 'xs' to 'xl', 'cover', 'full'; `scrollBehavior` 'inside' | 'outside'; `motionPreset` including 'none'. https://chakra-ui.com/docs/components/dialog
- Tabs, Chakra UI: `variant` 'line' | 'subtle' | 'enclosed' | 'outline' | 'plain'; `orientation`; `fitted`; Disabled Tab example. https://chakra-ui.com/docs/components/tabs
- Checkbox, Chakra UI: `variant` 'outline' | 'solid' | 'subtle'; `invalid`, `disabled`; examples include Indeterminate. https://chakra-ui.com/docs/components/checkbox
- Tooltip, Chakra UI: `openDelay` 400, `closeDelay` 150, `interactive`, `disabled`; Placement example. https://chakra-ui.com/docs/components/tooltip
- Card, Chakra UI: `variant` 'elevated' | 'outline' | 'subtle'; `size` 'sm' | 'md' | 'lg'. https://chakra-ui.com/docs/components/card
- Accordion, Chakra UI: `variant` 'outline' | 'subtle' | 'enclosed' | 'plain'; `multiple`, `collapsible`, `orientation`, Disabled Item. React Aria Disclosure states: expanded, disabled, focus-visible-within. https://chakra-ui.com/docs/components/accordion and https://react-aria.adobe.com/Disclosure
- Accordion, gallery description: items need a heading plus content, either heading with `button` using `aria-expanded` and `aria-controls`, or `<details>`/`<summary>`; "Some implementations allow for only a single accordion item to be expanded at any one time — do this with caution". https://component.gallery/components/accordion/
- Toast, Chakra UI: examples Closable Toast and Placement only; no prop table. https://chakra-ui.com/docs/components/toast

## 5. Naming and variant-set disagreements (summary)

Naming (all counts from the component's gallery page):
- Badge/Tag/Chip/Pill/Label: Badge 45 vs Tag 32 vs Chip 8 vs Pill 7 vs Label 5 for the same page. Gallery aliases: Tag, Label, Chip.
- Modal vs Dialog: 42 vs 25, plus "Alert Dialog" (4) for the confirm variant. Chakra and Drawer expose `alertdialog` as a role.
- Alert/Banner/Notification/Message/Callout, and Toast/Snackbar: the gallery treats Toast as a related page of Alert, described as "a type of alert which appears in a layer above other content".
- Select vs Dropdown; Dropdown menu vs Menu vs Navigation (the gallery lists "Menu" as an alias of both Navigation and Dropdown menu).
- Toggle vs Switch (Switch 32, Toggle 19); Toggle also an alias for toggle buttons, overlapping Segmented control.
- Stepper: both the progress-steps component and the numeric nudger; the gallery split them into two pages.
- Accordion has the widest name spread (Accordion 51 of 101 examples, plus Details, Disclosure, Collapse, Collapsible, Expander).
- Divider vs Separator; Spinner vs Loader vs Loading vs Spin; Date picker vs Datepicker vs Calendar; Breadcrumb vs Breadcrumbs (even split, 27 each); Drawer vs Sheet vs Tray vs Flyout vs Panel.
- Casing and spelling: Date picker / Datepicker / DatePicker; Text area / Textarea / TextArea; Radio / Radio button / Radio group.

Variant sets (from section 3 sources):
- Severity: Primer critical/info/success/upsell/warning; Atlassian information/warning/success/error/discovery; Chakra info/warning/success/error/neutral; Ant success/info/warning/error; Bootstrap eight colour names; shadcn default/destructive.
- Style axis: Chakra has `variant` for look (subtle, surface, outline, solid) and `status` for meaning on Alert. Ant added `variant` (outlined/filled) to Alert in 6.4.0 beside `type`. Primer and Atlassian have only the meaning axis.
- Orientation, size and placement vocabularies: Chakra drawer uses start/end/top/bottom; Ant uses top/right/bottom/left.
- Size scales: Chakra uses xs to xl on most (3 to 7 steps, varies per component); Ant uses small/medium/large; Primer small/medium/large or small/medium.
- States: Chakra documents Disabled, Invalid, Indeterminate, Loading as examples; React Aria documents hovered, pressed, focused, focus-visible, selected, disabled, read-only, invalid, required, open, expanded, dragging, entering, exiting as CSS-selectable states; Primer and Ant add `loading` on Switch (Ant, Primer) and Combobox (Primer).

## 6. Sources not reached or incomplete

- https://carbondesignsystem.com/ : connection failed (curl exit 000, no HTTP response) from this session, on `components/notification/usage/`, `components/loading/usage/` and `components/toggle/usage/`. No Carbon content in this file.
- https://ariakit.org/ : same failure on `components/combobox`. https://polaris.shopify.com/ also failed to connect; Polaris's current docs live on shopify.dev (linked from the gallery), which was not tried.
- https://spectrum.adobe.com/page/... : the host answered but `in-line-alert`, `alert-banner` and `switch` returned HTTP 404 (the gallery's links are stale or the site moved). React Aria (https://react-aria.adobe.com/) was used instead for Adobe's component states and props.
- https://m3.material.io/components/switch/overview : returned only "This website requires JavaScript" with no content. Material Design is therefore not covered.
- Not tried or not read: Fluent UI (developer.microsoft.com), Lightning (lightningdesignsystem.com), Pajamas (design.gitlab.com), Base Web, Atlassian pages other than Section message, MDN and W3C APG pages, mui.com (Material UI is not in the gallery's 94 design-system names; its home page was reachable but was not mined).
- The WebFetch tool could not resolve primer.style, atlassian.design, carbondesignsystem.com, design-system.service.gov.uk or spectrum.adobe.com (its network allowlist differs from the shell's), so all page content in this file was read with curl from the shell and parsed.
- Parsing note: Chakra, Ant, Radix, React Aria and Primer prop tables were extracted programmatically from the fetched HTML. Primer prop types come from the JSON embedded in each page. Gallery counts were computed from the gallery's own HTML (data-example-count attribute and the example list on each component page).
- Not verified from a page: the claim that React Aria has separate DateField, DateRangePicker and Calendar pages (3.10) is from my general knowledge (unverified). The first-round "Form field" mapping to Label, Fieldset and Form is a judgement (unverified).
