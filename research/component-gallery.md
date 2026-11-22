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