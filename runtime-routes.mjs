export const class2Components = [
  'tabs', 'menu-bar', 'sidebar', 'breadcrumbs', 'table-of-contents',
  'badge', 'banner', 'surface', 'layer-card', 'grid', 'grid-item', 'loader',
  'meter', 'empty', 'label', 'link', 'text', 'cloudflare-logo', 'code', 'table',
  'radio', 'autocomplete', 'combobox', 'command-palette', 'date-picker',
  'date-range-picker', 'dropdown-menu', 'toasty', 'pagination',
];

const class2 = new Set(class2Components);

export function class2RuntimeRoute(pathname) {
  const match = pathname.match(/^\/([^/]+)\/react\/?$/);
  return match && class2.has(match[1])
    ? { component: match[1], needsSlash: !pathname.endsWith('/') }
    : null;
}
