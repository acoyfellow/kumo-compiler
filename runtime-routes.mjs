import manifest from './deploy-manifest.json' with { type: 'json' };

export { manifest as deployManifest };

function matchPattern(pattern, pathname) {
  const names = [];
  const source = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:([A-Za-z]+)/g, (_, name) => {
    names.push(name);
    return '([^/]+)';
  });
  const match = pathname.match(new RegExp(`^${source}$`));
  return match && Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
}

function fill(template, params) {
  return template.replace(/:([A-Za-z]+)/g, (_, name) => params[name]);
}

export function runtimeRoute(pathname, source = manifest) {
  for (const route of source.routes) {
    let candidate = pathname;
    let needsSlash = false;
    if (route.canonicalSlash && !candidate.endsWith('/')) {
      candidate += '/';
      needsSlash = true;
    }
    const params = matchPattern(route.pattern, candidate);
    if (!params) continue;
    if (route.components && !route.components.includes(params.component)) continue;
    if (route.frameworks && !route.frameworks.includes(params.framework)) continue;
    return { id: route.id, asset: fill(route.asset, params), params, needsSlash };
  }
  return null;
}

const nonClass2 = new Set(['select', 'button', 'dialog', 'popover', 'checkbox', 'switch', 'field', 'input', 'input-group', 'input-area', 'sensitive-input', 'clipboard-text']);
export const class2Components = manifest.routes[0].components.filter((component) => !nonClass2.has(component));
export function class2RuntimeRoute(pathname) {
  const route = runtimeRoute(pathname);
  return route?.params.framework === 'react' && class2Components.includes(route.params.component)
    ? { component: route.params.component, needsSlash: route.needsSlash }
    : null;
}
