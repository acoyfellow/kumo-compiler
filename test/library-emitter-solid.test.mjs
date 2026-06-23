import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {emitSolidLibrary} from '../src/kumo/emitters/solid/index.mjs';
import {loadLibrary} from '../src/kumo/library/index.mjs';
import {compareMarkup} from '../scripts/observable-runner.mjs';

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const digestTree = directory => sha(Buffer.from(fs.readdirSync(directory).sort().map(file => `${file}\0${sha(fs.readFileSync(path.join(directory, file)))}\n`).join('')));

test('Solid candidate emitter is generic, complete, deterministic, and consumable', t => {
  const first = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-a-'));
  const second = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-b-'));
  t.after(() => { fs.rmSync(first, {recursive:true, force:true}); fs.rmSync(second, {recursive:true, force:true}); });

  const a = emitSolidLibrary({outputPath:first});
  const b = emitSolidLibrary({outputPath:second});
  assert.equal(a.components.length, 41);
  assert.deepEqual(a.components.map(x => x.component), a.components.map(x => x.component).toSorted());
  assert.deepEqual(a.components, b.components);
  assert.equal(digestTree(first), digestTree(second));

  const manifest = JSON.parse(fs.readFileSync(path.join(first, 'manifest.json')));
  const pkg = JSON.parse(fs.readFileSync(path.join(first, 'package.json')));
  const library = loadLibrary();
  assert.deepEqual({candidate:manifest.candidate, count:manifest.count}, {candidate:true, count:41});
  assert.equal('readinessProof' in manifest, false);
  assert.deepEqual([pkg.name, pkg.version], ['@acoyfellow/kumo-solid', '0.0.1']);
  assert.deepEqual(Object.keys(pkg.exports), ['.', ...new Set(a.components.map(x => x.subpath))]);
  assert.deepEqual(manifest.components.map(x => x.modelDigest), library.models.map(x => x.modelDigest));
  assert.deepEqual(manifest.components.map(x => x.contentBindingDigest), library.models.map(x => x.contentBindings.capabilityDigest));
  assert.ok(manifest.components.every(x => x.contentBindingDigest === library.contentBindings.capabilityDigest));
  assert.deepEqual(manifest.components.map(x => x.compoundPaths), library.models.map(model => model.composition.compoundExports?.paths.map(x => x.path) ?? []));
  assert.deepEqual(manifest.components.map(x => x.semanticVariants), library.models.map(model => (model.draftImplementation.semanticVariants ?? []).map(({id, expectationDigest}) => ({id, expectationDigest}))));
  assert.deepEqual(manifest.components.map(x => x.unresolvedSemanticOperations), library.models.map(model => model.unresolvedSemanticOperations ?? []));
  assert.equal(manifest.components.flatMap(x => x.semanticVariants).length, 66);
  assert.equal(manifest.components.flatMap(x => x.unresolvedSemanticOperations).length, 0);

  for (const item of manifest.components) {
    assert.equal(item.sha256, sha(fs.readFileSync(path.join(first, item.source))));
    assert.ok(fs.statSync(path.join(first, item.declaration)).size > 0);
    const lastForSubpath = manifest.components.findLast(x => x.subpath === item.subpath);
    assert.deepEqual(pkg.exports[item.subpath], {source:`./${lastForSubpath.source}`, types:`./${lastForSubpath.declaration}`});
  }
  assert.deepEqual(pkg.exports['.'], {source:'./index.ts', types:'./index.d.ts'});

  for (const [item, model] of manifest.components.map((item, index) => [item, library.models[index]])) {
    const source = fs.readFileSync(path.join(first, item.source), 'utf8');
    assert.match(source, new RegExp(`export const contentBindingDigest = ${JSON.stringify(model.contentBindings.capabilityDigest)}`));
    if (JSON.stringify(model.draftImplementation).includes('consumer-children')) assert.match(source, /props\.children/);
    for (const pathValue of model.composition.compoundExports?.paths.map(x => x.path) ?? []) {
      assert.match(source, new RegExp(`data-kumo-part=\\${JSON.stringify(pathValue)}`));
      const segments = pathValue.split('.');
      assert.match(source, new RegExp(`Object\\.defineProperty\\([^\\n]+${segments.at(-1)}`));
    }
  }

  const output = path.join(first, 'typecheck');
  fs.symlinkSync(path.resolve('node_modules'), path.join(first, 'node_modules'), 'dir');
  execFileSync(path.resolve('node_modules/.bin/tsc'), [
    '--noEmit', '--strict', '--skipLibCheck', '--typeRoots', path.resolve('node_modules/@types'), '--target', 'ES2022', '--module', 'ESNext',
    '--moduleResolution', 'Bundler', '--jsx', 'preserve', '--jsxImportSource', 'solid-js',
    ...a.components.map(x => path.join(first, x.source)), path.join(first, 'index.ts')
  ], {stdio:'pipe'});
  fs.rmSync(path.join(first, 'node_modules'));
  assert.equal(fs.existsSync(output), false);

  const downstream = fs.readdirSync(first).filter(x => /\.(?:tsx|ts|json)$/.test(x)).map(x => fs.readFileSync(path.join(first, x), 'utf8')).join('\n');
  assert.doesNotMatch(downstream, /React|innerHTML|demo|@cloudflare\/|return\s+null/);
  const emitter = fs.readFileSync(new URL('../src/kumo/emitters/solid/index.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(emitter, /switch\s*\(\s*(?:model\.)?component|if\s*\(\s*(?:model\.)?component\s*===|case\s+["'](?:autocomplete|badge|banner|button|select)["']\s*:/);
  assert.doesNotMatch(emitter, /model\.component\s*===\s*["']button["']/);
  assert.doesNotMatch(emitter, /model\.component\s*===\s*["'](?:checkbox|switch|radio|field)["']/);

  for (const name of ['checkbox', 'switch']) {
    const toggleSource = fs.readFileSync(path.join(first, `${name}.tsx`), 'utf8');
    assert.match(toggleSource, /const controlled = incoming\.checked !== undefined/);
    assert.match(toggleSource, /incoming\.defaultChecked \?\? false/);
    assert.match(toggleSource, /if \(props\.disabled\) return/);
    assert.match(toggleSource, /props\.onCheckedChange/);
  }
  assert.match(fs.readFileSync(path.join(first, 'checkbox.tsx'), 'utf8'), /<span[^>]*role="checkbox"[^>]*aria-checked=\{currentIndeterminate\(\) \? "mixed" : checked\(\)\}[^>]*onClick=\{toggleChecked\}/);
  assert.match(fs.readFileSync(path.join(first, 'switch.tsx'), 'utf8'), /<button[^>]*type="button"[^>]*role="switch"[^>]*aria-checked=\{checked\(\)\}[^>]*onClick=\{toggleChecked\}/);
  for (const name of ['radio', 'field']) assert.doesNotMatch(fs.readFileSync(path.join(first, `${name}.tsx`), 'utf8'), /toggleChecked|defaultChecked/);

  for (const [name, tag, element] of [['input', 'input', 'HTMLInputElement'], ['input-area', 'textarea', 'HTMLTextAreaElement']]) {
    const inputSource = fs.readFileSync(path.join(first, `${name}.tsx`), 'utf8');
    const inputDeclaration = fs.readFileSync(path.join(first, `${name}.d.ts`), 'utf8');
    assert.match(inputSource, new RegExp(`<${tag}[^>]*value=\\{props\\.defaultValue[^>]*disabled=\\{Boolean\\(props\\.disabled\\)\\}[^>]*onInput=\\{nativeInputHandler\\}`));
    assert.match(inputSource, /props\.label != null \? <div><label for="kumo-[a-f0-9]{12}">\{props\.label as JSX\.Element\}<\/label>/);
    const id = inputSource.match(/<label for="(kumo-[a-f0-9]{12})"/)[1];
    assert.match(inputSource, new RegExp(`<${tag} \\{\\.\\.\\.native\\} id="${id}"`));
    assert.match(inputSource, new RegExp(`: <${tag} \\{\\.\\.\\.native\\} class=`));
    assert.match(inputSource, /event\.currentTarget\.value/);
    assert.match(inputDeclaration, new RegExp(`JSX\\.${tag === 'input' ? 'Input' : 'Textarea'}HTMLAttributes<${element}>`));
  }
  const fieldSource = fs.readFileSync(path.join(first, 'field.tsx'), 'utf8');
  assert.match(fieldSource, /<div><label for=\{props\.controlId as string \?\? "field-control"\}>\{props\.label as JSX\.Element\}<\/label>\{props\.children\}<\/div>/);
  assert.doesNotMatch(fieldSource, /nativeInputHandler|event\.currentTarget\.value/);

  const autocompleteSource = fs.readFileSync(path.join(first, 'autocomplete.tsx'), 'utf8');
  assert.match(autocompleteSource, /const props = mergeProps/);
  assert.match(autocompleteSource, /<input ref=\{autocompleteInput\} placeholder=\{autocompleteInputGroup\(\)\.props\.placeholder as string\}/);
  assert.match(autocompleteSource, /onInput=\{autocompleteOnInput\} onKeyDown=\{autocompleteKeyDown\}/);
  assert.match(autocompleteSource, /<Show when=\{autocompleteOpen\(\)\} children=/);
  assert.match(autocompleteSource, /<ul role="listbox"><For each=\{autocompleteItems\(\)\} children=/);
  assert.match(autocompleteSource, /<li role="option" data-value=\{item\.value\}/);
  assert.match(autocompleteSource, /if \(value\.length > 0 && !autocompleteOpen\(\)\) setAutocompleteOpen\(true\)/);
  assert.match(autocompleteSource, /event\.key === "ArrowDown"/);
  assert.match(autocompleteSource, /event\.key === "Enter"/);
  assert.match(autocompleteSource, /props\.onOpenChange/);
  assert.match(autocompleteSource, /props\.onValueChange/);
  assert.doesNotMatch(autocompleteSource, /semanticEqual\(normalizedFixture/);

  const comboboxSource = fs.readFileSync(path.join(first, 'combobox.tsx'), 'utf8');
  assert.match(comboboxSource, /const props = mergeProps/);
  assert.match(comboboxSource, /<input ref=\{comboboxInput\} placeholder=\{comboboxTrigger\(\)\.props\.placeholder as string\}/);
  assert.match(comboboxSource, /<Show when=\{comboboxOpen\(\)\} children=/);
  assert.match(comboboxSource, /<ul role="listbox"><For each=\{comboboxItems\(\)\} children=/);
  assert.match(comboboxSource, /<li role="option" data-value=\{item\.value\}/);
  assert.match(comboboxSource, /event\.key === "ArrowDown"/);
  assert.match(comboboxSource, /event\.key === "Enter"/);
  assert.match(comboboxSource, /props\.onOpenChange/);
  assert.match(comboboxSource, /props\.onValueChange/);
  assert.doesNotMatch(comboboxSource, /semanticEqual\(normalizedFixture/);

  const commandPaletteSource = fs.readFileSync(path.join(first, 'command-palette.tsx'), 'utf8');
  const commandPaletteDeclaration = fs.readFileSync(path.join(first, 'command-palette.d.ts'), 'utf8');
  assert.match(commandPaletteSource, /import \{ For, Show, createSignal, mergeProps, onMount, splitProps \} from "solid-js"/);
  assert.match(commandPaletteSource, /props\.text !== undefined \? <span><For each=\{highlightSegments\(\)\}/);
  assert.match(commandPaletteSource, /segment\.mark \? <mark>\{segment\.text\}<\/mark> : segment\.text/);
  assert.match(commandPaletteSource, /data-kumo-component="CommandPalette"/);
  assert.match(commandPaletteSource, /onMount\(\(\) => \{ if \(paletteOpen\(\) && paletteItems\(\)\[0\]\)/);
  assert.match(commandPaletteSource, /event\.key === "ArrowDown"/);
  assert.match(commandPaletteSource, /event\.key === "Escape"/);
  assert.match(commandPaletteSource, /commandPaletteInput\?\.blur\(\)/);
  assert.doesNotMatch(commandPaletteSource, /semanticEqual\(normalizedFixture/);
  assert.match(commandPaletteDeclaration, /"highlights"\?: Array<\[number, number\]>;/);
  assert.match(commandPaletteDeclaration, /"onHighlightChange"\?: \(value: string\) => void;/);

  const sensitiveSource = fs.readFileSync(path.join(first, 'sensitive-input.tsx'), 'utf8');
  assert.match(sensitiveSource, /const props = mergeProps/);
  assert.match(sensitiveSource, /<div data-kumo-component="SensitiveInput">/);
  assert.match(sensitiveSource, /<div data-kumo-part="masked-container" onClick=\{revealSensitive\}>/);
  assert.match(sensitiveSource, /<input[^>]*type="password"/);
  assert.equal((sensitiveSource.match(/<button type="button"/g) ?? []).length, 2);
  assert.match(sensitiveSource, /<div aria-live="polite">\{sensitiveAnnouncement\(\)\}<\/div>/);
  assert.match(sensitiveSource, /navigator\.clipboard\.writeText\(sensitiveValue\(\)\)/);
  assert.match(sensitiveSource, /setSensitiveAnnouncement\("Copied to clipboard"\)/);
  assert.match(sensitiveSource, /props\.onValueChange/);
  assert.match(sensitiveSource, /props\.onCopy/);
  assert.doesNotMatch(sensitiveSource, /semanticEqual\(normalizedFixture/);

  const toastySource = fs.readFileSync(path.join(first, 'toasty.tsx'), 'utf8');
  const toastyDeclaration = fs.readFileSync(path.join(first, 'toasty.d.ts'), 'utf8');
  assert.match(toastySource, /const props = mergeProps/);
  assert.match(toastySource, /data-kumo-component="Toasty"/);
  assert.match(toastySource, /data-notify onClick=\{notifyToast\}>Notify/);
  assert.match(toastySource, /role="status" aria-live="polite"/);
  assert.match(toastySource, /<strong>Saved<\/strong><span>Changes saved<\/span>/);
  assert.match(toastySource, /data-toast-action onClick=\{toastAction\}/);
  assert.match(toastySource, /aria-label="Close" onClick=\{closeToast\}/);
  assert.match(toastySource, /setTimeout\(\(\) => \{ if \(document\.activeElement === close\) close\.blur\(\); setToastVisible\(false\); \}, 300\)/);
  assert.match(toastySource, /props\.onNotify/);
  assert.match(toastySource, /props\.onAction/);
  assert.doesNotMatch(toastySource, /innerHTML/);
  assert.match(toastyDeclaration, /"onNotify"\?: \(\) => void;/);
  assert.match(toastyDeclaration, /"onAction"\?: \(\) => void;/);

  const clipboardSource = fs.readFileSync(path.join(first, 'clipboard-text.tsx'), 'utf8');
  const clipboardDeclaration = fs.readFileSync(path.join(first, 'clipboard-text.d.ts'), 'utf8');
  assert.match(clipboardSource, /return \(<div>\{props\.text as JSX\.Element\}<button type="button" onClick=\{copyText\}>Copy<\/button><span aria-live="polite">\{copyStatus\(\)\}<\/span><\/div>\)/);
  assert.doesNotMatch(clipboardSource, /copyOnKeyDown/);
  assert.match(clipboardSource, /navigator\.clipboard\.writeText\(\(props\.textToCopy \?\? props\.text\) as string\)/);
  assert.match(clipboardSource, /props\.onCopy[\s\S]*setCopyStatus\("Copied"\)/);
  assert.match(clipboardDeclaration, /"textToCopy"\?: string;/);
  assert.match(clipboardDeclaration, /"text"\?: string;/);
  assert.match(clipboardDeclaration, /"onCopy"\?: \(\) => void;/);

  const radioSource = fs.readFileSync(path.join(first, 'radio.tsx'), 'utf8');
  assert.match(radioSource, /<div ref=\{radioRoot\} role="radiogroup" aria-label=\{radioFixture\(\)\.legend\}>/);
  assert.match(radioSource, /<For each=\{radioFixture\(\)\.items\} children=/);
  assert.match(radioSource, /<div role="radio" aria-checked=\{selectedValue\(\) === item\.value\} aria-label=\{item\.label\}/);
  assert.match(radioSource, /aria-disabled=\{Boolean\(radioFixture\(\)\.disabled \|\| item\.disabled\) \|\| undefined\}/);
  assert.match(radioSource, /tabindex=\{radioFixture\(\)\.disabled \|\| item\.disabled \? undefined : 0\}/);
  assert.doesNotMatch(radioSource, /role="radiogroup"[^>]*tabindex/);
  assert.match(radioSource, /if \(radioFixture\(\)\.disabled \|\| item\.disabled\) return/);
  assert.match(radioSource, /props\.onValueChange/);
  assert.match(radioSource, /radioRoot\.setAttribute\('tabindex', '-1'\); radioRoot\.focus\(\)/);
  assert.match(radioSource, /event\.key !== "ArrowDown"/);
  assert.match(radioSource, /const props = mergeProps/);

  const tabsSource = fs.readFileSync(path.join(first, 'tabs.tsx'), 'utf8');
  assert.match(tabsSource, /const props = mergeProps/);
  assert.match(tabsSource, /return \(<div><For each=\{props\.tabs as TabItem\[\]\}/);
  assert.equal((tabsSource.match(/role="tab"/g) ?? []).length, 1);
  assert.match(tabsSource, /aria-selected=\{selectedValue\(\) === item\.value\}/);
  assert.match(tabsSource, /const \[focusedIndex, setFocusedIndex\] = createSignal\(selectedIndex\(\)\)/);
  assert.match(tabsSource, /event\.key === "ArrowRight"/);
  assert.match(tabsSource, /props\.activateOnFocus/);
  assert.match(tabsSource, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(tabsSource, /onValueChange as \(\(value: string\) => void\) \| undefined\)\?\.\(value\)/);

  const menuBarSource = fs.readFileSync(path.join(first, 'menu-bar.tsx'), 'utf8');
  const menuBarClasses = library.menubarNavigation.root.classes.join(' ');
  assert.match(menuBarSource, new RegExp(`<nav class=${JSON.stringify(menuBarClasses)}`));
  assert.match(menuBarSource, /<For each=\{props\.options as MenuBarOption\[\]\}/);
  assert.equal((menuBarSource.match(/<button/g) ?? []).length, 1);
  assert.match(menuBarSource, /type="button" aria-label=\{item\.tooltip\} title=\{item\.tooltip\}/);
  assert.match(menuBarSource, /<span aria-hidden="true">\{item\.icon\}<\/span>/);
  assert.doesNotMatch(menuBarSource, /aria-(?:selected|pressed|current)/);
  assert.match(menuBarSource, /event\.key !== "ArrowLeft" && event\.key !== "ArrowRight"/);
  assert.match(menuBarSource, /const props = mergeProps/);

  const dialogSource = fs.readFileSync(path.join(first, 'dialog.tsx'), 'utf8');
  const dialogDeclaration = fs.readFileSync(path.join(first, 'dialog.d.ts'), 'utf8');
  assert.match(dialogSource, /const props = mergeProps/);
  assert.match(dialogSource, /<button ref=\{triggerElement\} type="button" data-kumo-component="Dialog" data-kumo-part="trigger" aria-haspopup="dialog"/);
  assert.match(dialogSource, /<Show when=\{dialogOpen\(\)\} children=/);
  assert.match(dialogSource, /<Portal mount=\{document\.body\} children=/);
  assert.match(dialogSource, /role="dialog" tabindex="-1"/);
  assert.match(dialogSource, /data-kumo-part="close"/);
  assert.match(dialogSource, /props\.onOpenChange/);
  assert.match(dialogSource, /dialogElement\?\.focus\(\) : triggerElement\?\.focus\(\)/);
  assert.match(dialogDeclaration, /"open"\?: boolean;/);
  assert.match(dialogDeclaration, /"defaultOpen"\?: boolean;/);
  assert.match(dialogDeclaration, /"onOpenChange"\?: \(open: boolean\) => void;/);

  const inputGroupSource = fs.readFileSync(path.join(first, 'input-group.tsx'), 'utf8');
  assert.match(inputGroupSource, /<div data-kumo-component="InputGroup">/);
  assert.match(inputGroupSource, /<label for=\{inputGroupId\}>/);
  assert.match(inputGroupSource, /compoundFixtureText\(props\.fixture, "\.Addon"\)/);
  assert.match(inputGroupSource, /<input id=\{inputGroupId\}/);
  assert.match(inputGroupSource, /<button type="button" data-variant=/);
  assert.match(inputGroupSource, /compoundFixtureText\(props\.fixture, "\.Suffix"\)/);
  assert.match(inputGroupSource, /const \[inputGroupValue, setInputGroupValue\] = createSignal\(""\)/);
  assert.doesNotMatch(inputGroupSource, /semanticEqual\(normalizedFixture/);

  const paginationSource = fs.readFileSync(path.join(first, 'pagination.tsx'), 'utf8');
  assert.match(paginationSource, /<div data-slot="pagination"><nav ref=\{navEl\} aria-label=/);
  assert.match(paginationSource, /props\.fixtureMode !== "simple"/);
  assert.match(paginationSource, /props\.fixtureMode === "dropdown"/);
  assert.equal((paginationSource.match(/<button/g) ?? []).length, 6);
  assert.match(paginationSource, /<input aria-label="Page number" value=\{inputValue\(\)\}/);

  const buttonSource = fs.readFileSync(path.join(first, 'button.tsx'), 'utf8');
  const buttonDeclaration = fs.readFileSync(path.join(first, 'button.d.ts'), 'utf8');
  assert.match(buttonSource, /<button id=\{props\.id as string\}[^>]*type=\{\(props\.type/);
  assert.match(buttonSource, /onClick=\{props\.onClick as JSX\.EventHandlerUnion/);
  assert.match(buttonSource, /disabled=\{Boolean\(props\.disabled \|\| props\.loading\)\}/);
  assert.match(buttonSource, /props\.loading \? <svg aria-hidden="true" \/>/);
  assert.match(buttonSource, /\{props\.children\}<\/button>/);
  assert.match(buttonDeclaration, /JSX\.ButtonHTMLAttributes<HTMLButtonElement>/);
});

test('Solid SSR renders every compiled semantic predicate through canonical markup comparison', async t => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-ssr-'));
  const build = path.join(output, 'build');
  t.after(() => fs.rmSync(output, {recursive:true, force:true}));
  const result = emitSolidLibrary({outputPath:output});
  const repeated = fs.mkdtempSync(path.join(os.tmpdir(), 'kumo-solid-ssr-repeat-'));
  t.after(() => fs.rmSync(repeated, {recursive:true, force:true}));
  emitSolidLibrary({outputPath:repeated});
  assert.equal(digestTree(output), digestTree(repeated));
  fs.symlinkSync(path.resolve('node_modules'), path.join(output, 'node_modules'), 'dir');
  const typed = path.join(output, 'typed'); fs.mkdirSync(typed);
  execFileSync(path.resolve('node_modules/.bin/tsc'), [
    '--outDir', typed, '--skipLibCheck', '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--jsx', 'preserve', ...result.components.map(x => path.join(output, x.source))
  ], {stdio:'pipe'});
  fs.mkdirSync(build);
  const {transformFileAsync} = await import('@babel/core');
  for (const item of result.components) {
    const transformed = await transformFileAsync(path.join(typed, item.source.replace(/tsx$/, 'jsx')), {presets:[['babel-preset-solid',{generate:'ssr'}]]});
    fs.writeFileSync(path.join(build, item.source.replace(/tsx$/, 'js')), transformed.code);
  }
  const library = loadLibrary();
  const {renderToString} = await import('solid-js/web');
  const autocompleteItem = result.components.find(item => item.component === 'autocomplete');
  const autocompleteModule = await import(path.join(build, autocompleteItem.source.replace(/tsx$/, 'js')) + `?autocomplete=${Date.now()}`);
  const autocompleteContract = JSON.parse(fs.readFileSync(path.resolve('contracts/kumo.observable/v1/components/autocomplete.json')));
  const autocompleteFixture = autocompleteContract.vectors[0].fixture;
  const closedAutocomplete = renderToString(() => autocompleteModule.Autocomplete({fixture:autocompleteFixture}));
  assert.match(closedAutocomplete, /^<input[^>]*placeholder="Fruit"/);
  assert.doesNotMatch(closedAutocomplete, /role="listbox"|role="option"/);

  const comboboxItem = result.components.find(item => item.component === 'combobox');
  const comboboxModule = await import(path.join(build, comboboxItem.source.replace(/tsx$/, 'js')) + `?combobox=${Date.now()}`);
  const comboboxContract = JSON.parse(fs.readFileSync(path.resolve('contracts/kumo.observable/v1/components/combobox.json')));
  const comboboxFixture = comboboxContract.vectors[0].fixture;
  const closedCombobox = renderToString(() => comboboxModule.Combobox({fixture:comboboxFixture}));
  assert.match(closedCombobox, /^<input[^>]*placeholder="Fruit"/);
  assert.doesNotMatch(closedCombobox, /role="listbox"|role="option"/);

  const buttonItem = result.components.find(item => item.component === 'button');
  const buttonModule = await import(path.join(build, buttonItem.source.replace(/tsx$/, 'js')) + `?interactive=${Date.now()}`);
  const menuBarItem = result.components.find(item => item.component === 'menu-bar');
  const menuBarModule = await import(path.join(build, menuBarItem.source.replace(/tsx$/, 'js')) + `?menubar=${Date.now()}`);
  const menuClasses = library.menubarNavigation.root.classes.join(' ');
  const emptyMenu = renderToString(() => menuBarModule.MenuBar({options:[]}));
  assert.match(emptyMenu, new RegExp(`<nav class="${menuClasses}"></nav>`));
  assert.equal((emptyMenu.match(/<button/g) ?? []).length, 0);
  const populatedMenu = renderToString(() => menuBarModule.MenuBar({options:[{id:'one', tooltip:'One', icon:'1'}, {id:'two', tooltip:'Two', icon:'2'}], isActive:1}));
  assert.equal((populatedMenu.match(/<button/g) ?? []).length, 2);
  assert.doesNotMatch(populatedMenu, /aria-(?:selected|pressed|current)/);

  const paginationItem = result.components.find(item => item.component === 'pagination');
  const paginationModule = await import(path.join(build, paginationItem.source.replace(/tsx$/, 'js')) + `?pagination=${Date.now()}`);
  for (const [fixtureMode, count, hasInput] of [[undefined, 4, true], ['simple', 2, false], ['dropdown', 6, true]]) {
    const html = renderToString(() => paginationModule.Pagination({page:3, perPage:10, totalCount:40, fixtureMode}));
    assert.match(html, /<div data-slot="pagination"><nav aria-label="Pagination">/);
    assert.equal((html.match(/<button/g) ?? []).length, count);
    assert.equal(html.includes('aria-label="Page number"'), hasInput);
  }

  const toastyItem = result.components.find(item => item.component === 'toasty');
  const toastyModule = await import(path.join(build, toastyItem.source.replace(/tsx$/, 'js')) + `?toasty=${Date.now()}`);
  const toastyHtml = renderToString(() => toastyModule.Toasty({children:'Application'}));
  assert.match(toastyHtml, /^<div data-kumo-component="Toasty">Application<button type="button" data-notify>Notify<\/button><\/div>$/);
  assert.doesNotMatch(toastyHtml, /role="status"/);

  const interactive = [
    [{children:'Enabled', id:'enabled', onClick:() => {}}, /<button[^>]*id="enabled"[^>]*type="button"[^>]*>Enabled<\/button>/],
    [{children:'Disabled', disabled:true}, /<button[^>]*disabled[^>]*>Disabled<\/button>/],
    [{children:'Loading', loading:true}, /<button[^>]*disabled[^>]*><svg aria-hidden="true"><\/svg>Loading<\/button>/],
    [{children:'Submit', type:'submit', name:'intent', value:'save'}, /<button[^>]*name="intent"[^>]*value="save"[^>]*type="submit"[^>]*>Submit<\/button>/],
  ];
  for (const [props, expected] of interactive) assert.match(renderToString(() => buttonModule.Button(props)), expected);

  for (const [item, model] of result.components.map((item, index) => [item, library.models[index]])) {
    const module = await import(path.join(build, item.source.replace(/tsx$/, 'js')) + `?${Date.now()}`);
    for (const variant of model.draftImplementation.semanticVariants ?? []) {
      if (model.component === 'toasty') continue;
      const canonicalProps = Object.fromEntries(variant.when.filter(x => x.kind === 'prop-equals').map(x => [x.name, x.value]));
      const canonicalFixture = variant.when.find(x => x.kind === 'fixture-equals')?.value;
      // Match the shared packed fixture compiler: children arrive as nested native
      // child arrays/accessors, while all non-child predicate inputs remain generic.
      const packChildren = value => [() => [value]];
      const props = {...canonicalProps};
      if (Object.hasOwn(props, 'children')) props.children = packChildren(props.children);
      if (canonicalFixture !== undefined) props.fixture = structuredClone(canonicalFixture);
      const html = renderToString(() => module[item.symbol](props));
      const vector = library.semanticRender.components.find(x => x.component === model.component).vectors.find(x => x.id === variant.id);
      for (const constraint of vector.nodes) if (constraint.selector === ':root') {
        try { assert.equal(compareMarkup(html, {root:constraint.require}), true); }
        catch (error) { error.message = `${model.component}#${variant.id}: ${error.message}\n${html}`; throw error; }
      }
    }
  }
});
