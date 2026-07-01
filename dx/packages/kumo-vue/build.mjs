import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import ts from 'typescript'

const here = import.meta.dirname
const root = resolve(here, '../../..')
const source = resolve(root, 'generated/libraries/vue')
const output = resolve(here, 'package')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const json = value => JSON.stringify(value, null, 2) + '\n'

await rm(output, { recursive: true, force: true })
await mkdir(resolve(output, 'components'), { recursive: true })
const files = (await readdir(resolve(source, 'components'))).sort()
const vueFiles = files.filter(file => file.endsWith('.vue'))
const canonical = JSON.parse(await readFile(resolve(source, 'manifest.json'), 'utf8'))

for (const file of vueFiles) {
  const filename = resolve(source, 'components', file)
  const text = await readFile(filename, 'utf8')
  const { descriptor, errors } = parse(text, { filename })
  if (errors.length) throw new Error(`${file}: ${errors.join('\n')}`)
  const id = sha256(file).slice(0, 8)
  const symbol = canonical.components.find(component => `${component.component}.vue` === file)?.symbol
  const componentName = `Kumo${symbol ?? file.replace(/\.vue$/, '').split(/[.-]/).map(part => part[0]?.toUpperCase()+part.slice(1)).join('')}`
  const script = compileScript(descriptor, { id, genDefaultAs: '__sfc__' })
  const ssrCssVars = descriptor.cssVars ?? []
  const template = compileTemplate({
    id,
    filename: `${componentName}.vue`,
    source: descriptor.template?.content ?? '',
    compilerOptions: { bindingMetadata: script.bindings, expressionPlugins: ['typescript'] },
  })
  if (template.errors.length) throw new Error(`${file}: ${template.errors.join('\n')}`)
  // Also emit an SSR render function so the component is server-renderable
  // (Astro/@astrojs/vue looks for ssrRender / __ssrInlineRender). We keep the
  // client `render` for hydration; the built __sfc__ supports BOTH.
  const ssrTemplate = compileTemplate({
    id,
    filename: `${componentName}.vue`,
    source: descriptor.template?.content ?? '',
    ssr: true,
    ssrCssVars,
    compilerOptions: { bindingMetadata: script.bindings, expressionPlugins: ['typescript'] },
  })
  if (ssrTemplate.errors.length) throw new Error(`${file} (ssr): ${ssrTemplate.errors.join('\n')}`)
  const combined = `${script.content}\n${template.code.replace('export function render', 'function render')}\n${ssrTemplate.code.replace('export function ssrRender', 'function ssrRender')}\n__sfc__.render = render\n__sfc__.ssrRender = ssrRender\n__sfc__.name = ${JSON.stringify(componentName)}\n__sfc__.__file = ${JSON.stringify(`components/${file}`)}\nexport default __sfc__\n`
  const javascript = ts.transpileModule(combined, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: file,
  }).outputText
  await writeFile(resolve(output, 'components', file.replace(/\.vue$/, '.js')), javascript + (symbol ? `\nexport { __sfc__ as ${symbol} }\n` : ''))
}

for (const file of files.filter(file => file.endsWith('.d.ts'))) {
  const text = await readFile(resolve(source, 'components', file), 'utf8')
  const symbol = canonical.components.find(component => `${component.component}.d.ts` === file)?.symbol
  await writeFile(resolve(output, 'components', file), text + (symbol ? `\nexport { component as ${symbol} };\n` : ''))
}
// Bridge any snapshotted browser-proven implementation with the generated semantic
// implementation using only model predicates. This keeps migration behavior without
// component-name branches or hidden semantic exceptions.
const legacy = resolve(here, '.package-legacy')
for (const file of (await readdir(legacy)).filter(file => file.endsWith('.js')).sort()) {
  const component = file.slice(0,-3)
  const entry = canonical.components.find(item => item.component === component)
  if (!entry) throw new Error(`${component}: legacy bridge lacks canonical model`)
  const model = JSON.parse(await readFile(resolve(root,'src/kumo/library/models',`${component}.json`),'utf8'))
  if(model.interactions?.nativeButton)continue
  // Field ships the compiler-generated component (real Kumo classes, no invented BEM legacy).
  if(component==='field')continue
  const variants = (model.draftImplementation.semanticVariants ?? []).map(({id,when}) => ({id,when}))
  await cp(resolve(output,'components',`${component}.js`),resolve(output,'components',`${component}.semantic.js`))
  await cp(resolve(legacy,file),resolve(output,'components',`${component}.legacy.js`))
  await cp(resolve(legacy,`${component}.d.ts`),resolve(output,'components',`${component}.d.ts`))
  const bridge = `import{defineComponent,h}from'vue';import{ssrRenderComponent as _ssrRenderComponent}from'vue/server-renderer';import Semantic from'./${component}.semantic.js';import Legacy from'./${component}.legacy.js';\nconst variants=${JSON.stringify(variants)};const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);const text=v=>Array.isArray(v)?v.map(text).join(''):v==null||typeof v==='boolean'?'':typeof v==='string'||typeof v==='number'?String(v):text(v.children);const matches=(when,values,fixture)=>when.every(p=>p.kind==='prop-equals'?equal(p.name==='children'?values.children:values[p.name],p.value):p.kind==='fixture-equals'?equal(fixture,p.value):false);const pick=(attrs,slots)=>{const content=text(slots.default?.()),values={...attrs,children:content},semantic=variants.some(v=>matches(v.when,values,attrs.fixture));return{target:semantic?Semantic:Legacy,props:semantic?{...attrs,semanticContent:content}:attrs}};const Bridge=defineComponent({name:${JSON.stringify(`Kumo${entry.symbol}Bridge`)},inheritAttrs:false,setup(_,{attrs,slots}){return()=>{const{target,props}=pick(attrs,slots);return h(target,props,slots)}}});\n// SSR render so Astro/@astrojs/vue can server-render the bridge (it checks for ssrRender); delegates to the chosen child's SSR path.\nBridge.ssrRender=(_ctx,_push,_parent)=>{const{target,props}=pick(_ctx.$attrs,_ctx.$slots);_push(_ssrRenderComponent(target,props,_ctx.$slots,_parent))};\nexport{Bridge as ${entry.symbol}};export default Bridge;\n`
  await writeFile(resolve(output,'components',`${component}.js`),bridge)
}

const index = (await readFile(resolve(source, 'index.ts'), 'utf8')).replace(/\.vue(['"])/g, '.js$1')
await writeFile(resolve(output, 'index.js'), ts.transpileModule(index, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText)
await cp(resolve(source, 'index.d.ts'), resolve(output, 'index.d.ts'))

// Styles are generated independently of the framework emitter; keep all package CSS inputs.
const previous = resolve(here, '.package-css')
for (const file of (await readdir(here)).filter(file => file.endsWith('.css')).sort())
  await cp(resolve(here, file), resolve(output, file))
// During migration styles may only exist in the prior package directory. build inputs are snapshotted below.
if (await readdir(output).then(xs => !xs.some(x => x.endsWith('.css')))) {
  try { for (const file of (await readdir(previous)).filter(x => x.endsWith('.css')).sort()) await cp(resolve(previous, file), resolve(output, file)) } catch {}
}
const canonicalCss=await readFile(resolve(root,'node_modules/@cloudflare/kumo/dist/styles/kumo-standalone.css'),'utf8')
let packageCss='';try{packageCss=await readFile(resolve(output,'styles.css'),'utf8')}catch{}
await writeFile(resolve(output,'styles.css'),`${canonicalCss}\n${packageCss}`)

const rootNames = new Set(canonical.components.map(component => component.component))
const compounds = vueFiles.map(file => file.replace(/\.vue$/, '')).filter(name => !rootNames.has(name))
const packageJson = JSON.parse(await readFile(resolve(here, 'package.json'), 'utf8'))
const exports = {
  '.': { types: './package/index.d.ts', import: './package/index.js' },
  ...Object.fromEntries(vueFiles.map(file => {
    const name = file.replace(/\.vue$/, '')
    return [`./${name}`, { types: `./package/components/${name}.d.ts`, import: `./package/components/${name}.js` }]
  })),
  './styles.css': './package/styles.css', './tokens.css': './package/tokens.css', './manifest': './kumo.manifest.json',
}
packageJson.exports = exports
packageJson.files = ['package', 'kumo.manifest.json']
await writeFile(resolve(here, 'package.json'), json(packageJson))

const sourceDigests = Object.fromEntries(await Promise.all(vueFiles.map(async file => [file, sha256(await readFile(resolve(source, 'components', file)))])))
const manifest = {
  schemaVersion: 3,
  name: packageJson.name,
  version: packageJson.version,
  framework: 'vue',
  modelDigest: sha256(canonical.components.map(x => x.modelDigest).join('\n')),
  contentBindingDigest: sha256(canonical.components.map(x => x.contentBindingDigest ?? '').join('\n')),
  semanticDigest: sha256(canonical.components.flatMap(x => x.semanticVariants ?? []).map(JSON.stringify).join('\n')),
  components: canonical.components.map(({ component, symbol, modelDigest, contentBindingDigest, semanticVariants = [] }) => ({ component, symbol, modelDigest, contentBindingDigest, semanticVariantCount: semanticVariants.length, sourceSha256: sourceDigests[`${component}.vue`] })),
  compoundExports: { count: compounds.length, paths: canonical.compoundPaths.map(part => ({...part,file:`package/${part.file.replace(/\.vue$/,'.js')}`,types:`package/${part.types}`})) },
  build: { compiler: '@vue/compiler-sfc', mode: 'client+ssr-render', sourceCount: vueFiles.length },
}
await writeFile(resolve(here, 'kumo.manifest.json'), json(manifest))
console.log(`built ${vueFiles.length} Vue SFCs (${canonical.components.length} roots + ${compounds.length} compounds)`)
