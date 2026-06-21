export const ALGEBRA_VERSION = 'kumo.component-algebra/v1';

export const NODE_KINDS = Object.freeze(['element', 'compound', 'text', 'children', 'slot', 'condition', 'collection', 'portal']);
export const EXPRESSION_KINDS = Object.freeze(['literal', 'prop', 'state', 'item', 'coalesce', 'equals', 'not', 'concat', 'style-ref']);
export const OPERATION_KINDS = Object.freeze(['render', 'emit', 'state', 'ref', 'focus', 'lifecycle', 'browser-service', 'portal', 'style']);

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const assertKeys = (value, allowed, where) => {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${where}: unknown field ${key}`);
};
const requiredString = (value, where) => {
  if (typeof value !== 'string' || !value) throw new Error(`${where}: expected non-empty string`);
};

export function validateExpression(expression, where = 'expression') {
  if (!object(expression) || !EXPRESSION_KINDS.includes(expression.kind)) throw new Error(`${where}: invalid expression`);
  const fields = {
    literal: ['kind', 'value'], prop: ['kind', 'name'], state: ['kind', 'name'], item: ['kind', 'name'],
    coalesce: ['kind', 'values'], equals: ['kind', 'left', 'right'], not: ['kind', 'value'],
    concat: ['kind', 'values', 'separator'], 'style-ref': ['kind', 'name']
  }[expression.kind];
  assertKeys(expression, fields, where);
  if (['prop', 'state', 'item', 'style-ref'].includes(expression.kind)) requiredString(expression.name, where);
  if (expression.kind === 'coalesce' || expression.kind === 'concat') {
    if (!Array.isArray(expression.values) || !expression.values.length) throw new Error(`${where}: values required`);
    expression.values.forEach((value, i) => validateExpression(value, `${where}.values[${i}]`));
  }
  if (expression.kind === 'equals') {
    validateExpression(expression.left, `${where}.left`); validateExpression(expression.right, `${where}.right`);
  }
  if (expression.kind === 'not') validateExpression(expression.value, `${where}.value`);
  return expression;
}

export function validateNode(node, where = 'node') {
  if (!object(node) || !NODE_KINDS.includes(node.kind)) throw new Error(`${where}: invalid node`);
  const fields = {
    element: ['kind', 'tag', 'attributes', 'properties', 'events', 'ref', 'styles', 'children'],
    compound: ['kind', 'name', 'parts'], text: ['kind', 'value'], children: ['kind'], slot: ['kind', 'name', 'fallback'],
    condition: ['kind', 'when', 'then', 'else'], collection: ['kind', 'source', 'item', 'key', 'template'],
    portal: ['kind', 'target', 'layer', 'children']
  }[node.kind];
  assertKeys(node, fields, where);
  if (node.kind === 'element') {
    requiredString(node.tag, `${where}.tag`);
    for (const group of ['attributes', 'properties', 'events']) if (node[group] !== undefined) {
      if (!object(node[group])) throw new Error(`${where}.${group}: expected object`);
      for (const [name, value] of Object.entries(node[group])) { requiredString(name, `${where}.${group}`); validateExpression(value, `${where}.${group}.${name}`); }
    }
    if (node.ref !== undefined) requiredString(node.ref, `${where}.ref`);
    if (node.styles !== undefined) {
      if (!Array.isArray(node.styles)) throw new Error(`${where}.styles: expected array`);
      node.styles.forEach((value, i) => validateExpression(value, `${where}.styles[${i}]`));
    }
    if (node.children !== undefined) node.children.forEach((value, i) => validateNode(value, `${where}.children[${i}]`));
  } else if (node.kind === 'compound') {
    requiredString(node.name, `${where}.name`);
    if (!object(node.parts) || !Object.keys(node.parts).length) throw new Error(`${where}.parts: required`);
    for (const [name, part] of Object.entries(node.parts)) { requiredString(name, where); validateNode(part, `${where}.parts.${name}`); }
  } else if (node.kind === 'text') validateExpression(node.value, `${where}.value`);
  else if (node.kind === 'slot') { requiredString(node.name, `${where}.name`); if (node.fallback) validateNode(node.fallback, `${where}.fallback`); }
  else if (node.kind === 'condition') {
    validateExpression(node.when, `${where}.when`); validateNode(node.then, `${where}.then`); if (node.else) validateNode(node.else, `${where}.else`);
  } else if (node.kind === 'collection') {
    validateExpression(node.source, `${where}.source`); requiredString(node.item, `${where}.item`); validateExpression(node.key, `${where}.key`); validateNode(node.template, `${where}.template`);
  } else if (node.kind === 'portal') {
    validateExpression(node.target, `${where}.target`); requiredString(node.layer, `${where}.layer`);
    node.children.forEach((value, i) => validateNode(value, `${where}.children[${i}]`));
  }
  return node;
}

export function validateImplementation(implementation) {
  if (!object(implementation)) throw new Error('implementation must be an object');
  assertKeys(implementation, ['algebraVersion', 'componentRoot', 'operations'], 'implementation');
  if (implementation.algebraVersion !== ALGEBRA_VERSION) throw new Error(`unknown algebra: ${implementation.algebraVersion}`);
  validateNode(implementation.componentRoot, 'implementation.componentRoot');
  if (!Array.isArray(implementation.operations)) throw new Error('implementation.operations must be an array');
  const ids = new Set();
  for (const [index, operation] of implementation.operations.entries()) {
    const where = `implementation.operations[${index}]`;
    if (!object(operation) || !OPERATION_KINDS.includes(operation.kind)) throw new Error(`${where}: invalid operation`);
    requiredString(operation.id, `${where}.id`);
    if (ids.has(operation.id)) throw new Error(`${where}: duplicate id`); ids.add(operation.id);
    assertKeys(operation, ['id', 'kind', 'action', 'target', 'event', 'callback', 'state', 'mode', 'initial', 'value', 'service', 'phase', 'layer', 'styles'], where);
    for (const field of ['action', 'target', 'event', 'callback', 'state', 'mode', 'service', 'phase', 'layer']) if (operation[field] !== undefined) requiredString(operation[field], `${where}.${field}`);
    if (operation.value !== undefined) validateExpression(operation.value, `${where}.value`);
    if (operation.initial !== undefined) validateExpression(operation.initial, `${where}.initial`);
    if (operation.styles !== undefined) operation.styles.forEach((value, i) => validateExpression(value, `${where}.styles[${i}]`));
  }
  return implementation;
}
