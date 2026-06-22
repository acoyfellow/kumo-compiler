import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';

const root = 'dx/packages/kumo-svelte';
const components = (await readdir(`${root}/package/components`)).filter(x => x.endsWith('.svelte')).map(x => x.slice(0, -7)).sort();

test('installable Svelte package exports all canonical components', async () => {
  const p = JSON.parse(await readFile(`${root}/package.json`, 'utf8'));
  assert.equal(`${p.name}@${p.version}`, '@acoyfellow/kumo-svelte@0.0.1');
  assert.equal(p.private, undefined);
  assert.equal(p.peerDependencies.svelte, '^5.0.0');
  assert.equal(components.length, 41);
  for (const name of components) {
    const entry = p.exports[`./${name}`];
    assert.ok(entry, name);
    assert.equal(entry.svelte, `./package/${name}.js`);
    assert.equal(entry.types, `./package/${name}.d.ts`);
    await readFile(`${root}/package/${name}.js`, 'utf8');
    await readFile(`${root}/package/${name}.d.ts`, 'utf8');
  }
  for (const x of ['.', './styles.css', './tokens.css', './manifest']) assert.ok(p.exports[x]);
  assert.deepEqual(p.sideEffects, ['./package/styles.css', './package/tokens.css']);
  const all = await Promise.all(components.map(x => readFile(`${root}/package/components/${x}.svelte`, 'utf8')));
  assert.ok(all.every(x => x.includes('$props')));
  assert.doesNotMatch(all.join('\n'), /React|customElements|{@html|NativeNode/);
});

test('Button and Field retain proven native behavior implementation', async () => {
  const button = await readFile(`${root}/package/components/button.svelte`, 'utf8');
  const field = await readFile(`${root}/package/components/field.svelte`, 'utf8');
  assert.match(button, /disabled=\{(?:Boolean\()?disabled \|\| loading\)?\}/);
  assert.match(field, /\$bindable/);
  assert.match(field, /aria-describedby=\{describedBy\}/);
  const styles = await readFile(`${root}/package/styles.css`, 'utf8');
  assert.match(styles, /@import ['"]\.\/tokens\.css['"]/);
});

test('receipt separates export proof from partial browser conformance', async () => {
  const r = JSON.parse(await readFile('proof/dx/svelte-library/receipt.json', 'utf8'));
  assert.equal(r.framework, 'svelte');
  assert.equal(r.exportSurface.componentCount, 41);
  assert.equal(new Set(r.exportSurface.slugExports).size, 41);
  assert.equal(new Set(r.exportSurface.rootSymbols).size, 104);
  assert.equal(new Set(r.exportSurface.declarationSymbols).size, 104);
  assert.equal(r.staticSemanticConformance.status,'passed');
  assert.equal(r.staticSemanticConformance.passed,66);
  assert.equal(r.staticSemanticConformance.unresolved,0);
  assert.deepEqual(r.browserConformance.verified, []);
  assert.equal(r.browserConformance.pending.length, 41);
  for(const key of ['liveHydration','serverNodeIdentity','buttonInteraction','fieldInteraction','hmr','screenReader']){
    assert.equal(r.checks[key].status,'not-run');assert.match(r.checks[key].reason,/observable-browser-runner/);
  }
  const proof=await readFile('proof/dx/svelte-library/run.mjs','utf8');
  assert.doesNotMatch(proof,/dispatchEvent|\.click\(|remote-debugging|WebSocket/);
  const { receiptHash, ...canonical } = r;
  assert.equal(receiptHash, createHash('sha256').update(JSON.stringify(canonical)).digest('hex'));
});
