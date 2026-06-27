# Components

Kumo ships **36 components**, each compiled to **3 native targets** (Vue,
Svelte, Solid) — **108 compiled cells** in total.

Every component is a **PascalCase named export** from each framework package and
carries a stable `kumo-*` custom-element tag. The export name and props are
identical across all three frameworks because every target is compiled from one
canonical definition.

```js
import { Button, DropdownMenu, Dialog } from '@acoyfellow/kumo-vue'
// …same names from @acoyfellow/kumo-svelte and @acoyfellow/kumo-solid
```

Components are organized into three groups.

## Presentational

Static, content-driven primitives — rendered server-clean with zero JavaScript
where possible.

| Component | Export | Tag |
| --- | --- | --- |
| Badge | `Badge` | `<kumo-badge>` |
| Banner | `Banner` | `<kumo-banner>` |
| Breadcrumbs | `Breadcrumbs` | `<kumo-breadcrumbs>` |
| Cloudflare Logo | `CloudflareLogo` | `<kumo-cloudflare-logo>` |
| Code | `Code` | `<kumo-code>` |
| Empty | `Empty` | `<kumo-empty>` |
| Grid | `Grid` | `<kumo-grid>` |
| Grid Item | `GridItem` | `<kumo-grid-item>` |
| Layer Card | `LayerCard` | `<kumo-layer-card>` |
| Link | `Link` | `<kumo-link>` |
| Loader | `Loader` | `<kumo-loader>` |
| Meter | `Meter` | `<kumo-meter>` |
| Surface | `Surface` | `<kumo-surface>` |
| Table | `Table` | `<kumo-table>` |
| Table Of Contents | `TableOfContents` | `<kumo-table-of-contents>` |
| Text | `Text` | `<kumo-text>` |

## Forms & inputs

Interactive controls — buttons, fields, toggles and selection inputs.

| Component | Export | Tag |
| --- | --- | --- |
| Button | `Button` | `<kumo-button>` |
| Checkbox | `Checkbox` | `<kumo-checkbox>` |
| Clipboard Text | `ClipboardText` | `<kumo-clipboard-text>` |
| Field | `Field` | `<kumo-field>` |
| Input | `Input` | `<kumo-input>` |
| Input Area | `InputArea` | `<kumo-input-area>` |
| Input Group | `InputGroup` | `<kumo-input-group>` |
| Label | `Label` | `<kumo-label>` |
| Pagination | `Pagination` | `<kumo-pagination>` |
| Radio | `Radio` | `<kumo-radio>` |
| Sensitive Input | `SensitiveInput` | `<kumo-sensitive-input>` |
| Switch | `Switch` | `<kumo-switch>` |

## Interactive & overlays

Stateful components with floating surfaces — open the menus, dialogs, listboxes
and popovers; they really work. These render an absolutely-positioned surface,
so make sure no ancestor clips it with `overflow: hidden`.

| Component | Export | Tag |
| --- | --- | --- |
| Autocomplete | `Autocomplete` | `<kumo-autocomplete>` |
| Combobox | `Combobox` | `<kumo-combobox>` |
| Dialog | `Dialog` | `<kumo-dialog>` |
| Dropdown Menu | `DropdownMenu` | `<kumo-dropdown-menu>` |
| Menu Bar | `MenuBar` | `<kumo-menu-bar>` |
| Popover | `Popover` | `<kumo-popover>` |
| Select | `Select` | `<kumo-select>` |
| Tabs | `Tabs` | `<kumo-tabs>` |

## Seeing them live

Every component above is rendered as its real compiled output in the gallery at
<https://kumo-compiler.coey.dev>. Each tile embeds the actual native cell for
all three frameworks side by side.
