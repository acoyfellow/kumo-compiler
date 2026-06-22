const identifier = value => /^[A-Za-z_$][\w$]*$/.test(value);
export const member = (base, name) => identifier(name) ? `${base}.${name}` : `${base}[${JSON.stringify(name)}]`;

export function requireContentBindings(model) {
  if (model.contentBindings?.schemaVersion !== 'kumo.content-bindings/v1' || !model.contentBindings.capabilityDigest) throw new Error(`${model.component}: content binding capability required`);
  return model.contentBindings.capabilityDigest;
}

export function normalizeRenderContent(value) {
  if (value == null || value === false || value === true) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(normalizeRenderContent).join('');
  if (typeof value === 'object') return `${typeof value.text === 'string' ? value.text : ''}${Array.isArray(value.children) ? value.children.map(normalizeRenderContent).join('') : ''}`;
  return '';
}

export function semanticPredicate(value, {props='props', fixture='fixture', content='renderContent', equal='semanticEqual'} = {}) {
  if (value.kind === 'prop-equals') return `Object.prototype.hasOwnProperty.call(${props}, ${JSON.stringify(value.name)}) && ${equal}(${member(props, value.name)}, ${JSON.stringify(value.value)})`;
  if (value.kind === 'fixture-equals') return `${equal}(${fixture}, ${JSON.stringify(value.value)})`;
  throw new Error(`unsupported semantic predicate: ${value.kind}`);
}

export function semanticExpression(value, {props='props', fixture='fixture', content='renderContent'} = {}) {
  if (value.kind === 'consumer-children') {
    if (value.contentRole !== 'consumer-content' || !value.predicateSource) throw new Error('consumer content requires an explicit content role and predicate source');
    return content;
  }
  if (value.kind === 'fixture') return fixture;
  if (value.kind === 'prop') return member(props, value.name);
  return null;
}
