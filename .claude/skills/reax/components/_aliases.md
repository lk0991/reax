# Aliases

A project's own names resolve to one card. Match case-insensitively, ignoring spaces, hyphens and a `Component` or `Base` suffix. A name not listed here gets `_rules.md` only.

| Card | Also called |
| --- | --- |
| button | Btn, ActionButton, IconButton, CTA, PushButton |
| input | TextField, TextInput, Textbox, Text box, InputField |
| textarea | TextArea, Text area, MultilineInput, MultilineTextField |
| checkbox | Check, CheckBox, Tickbox, Checkmark |
| radio | RadioButton, RadioGroup, RadioItem, Radio button |
| select | Dropdown, Picker, SelectBox, Listbox (single choice) |
| switch | Toggle, ToggleSwitch, Toggle switch, Lightswitch |
| link | Anchor, Hyperlink, TextLink, Text link |
| dialog | Modal, Popup, Lightbox, Overlay (modal), AlertDialog, ConfirmDialog |
| form-field | Field, FormControl, FormItem, FormGroup, Labelled, FormRow |
| combobox | Autocomplete, AutoComplete, Typeahead, ComboBox, SearchSelect, Autosuggest |
| menu | DropdownMenu, MenuButton, ActionMenu, ContextMenu, KebabMenu, OverflowMenu |
| tabs | Tab, TabList, TabGroup, TabBar, SegmentedTabs |
| tooltip | Tip, Hint tooltip, InfoTip |
| toast | Snackbar, Notification, Notice, Flash |
| disclosure | Accordion, Collapsible, Expander, Details, Expandable, Collapse |
| drawer | Side sheet, SideSheet, Sheet, BottomSheet, Bottom sheet, Offcanvas, Flyout, SidePanel |

Not aliases: a **Toggle button** (pressed state button) is a `button` with `aria-pressed`; a **Combobox** or **autocomplete** is not a `select`; a **Drawer** or **side sheet** is not a `dialog` (though a modal drawer meets the dialog card's requirements); a **Dropdown** for choosing a value is a `select`, and one holding actions is a `menu`; a **Popover** with interactive content is not a `tooltip` (no card yet).
