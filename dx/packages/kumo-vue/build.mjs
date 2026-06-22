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
  const script = compileScript(descriptor, { id, genDefaultAs: '__sfc__' })
  const template = compileTemplate({
    id,
    filename,
    source: descriptor.template?.content ?? '',
    compilerOptions: { bindingMetadata: script.bindings, expressionPlugins: ['typescript'] },
  })
  if (template.errors.length) throw new Error(`${file}: ${template.errors.join('\n')}`)
  const combined = `${script.content}\n${template.code.replace('export function render', 'function render')}\n__sfc__.render = render\n__sfc__.name = ${JSON.stringify(file.replace(/\.vue$/, ''))}\n__sfc__.__file = ${JSON.stringify(`components/${file}`)}\nexport default __sfc__\n`
  const javascript = ts.transpileModule(combined, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    fileName: file,
  }).outputText
  const symbol = canonical.components.find(component => `${component.component}.vue` === file)?.symbol
  await writeFile(resolve(output, 'components', file.replace(/\.vue$/, '.js')), javascript + (symbol ? `\nexport { __sfc__ as ${symbol} }\n` : ''))
}

for (const file of files.filter(file => file.endsWith('.d.ts'))) {
  const text = await readFile(resolve(source, 'components', file), 'utf8')
  const symbol = canonical.components.find(component => `${component.component}.d.ts` === file)?.symbol
  await writeFile(resolve(output, 'components', file), text + (symbol ? `\nexport { component as ${symbol} };\n` : ''))
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
  compoundExports: { count: compounds.length, paths: compounds.map(component => ({ component, file: `package/components/${component}.js` })) },
  build: { compiler: '@vue/compiler-sfc', mode: 'client-render', sourceCount: vueFiles.length },
}
await writeFile(resolve(here, 'kumo.manifest.json'), json(manifest))
console.log(`built ${vueFiles.length} Vue SFCs (${canonical.components.length} roots + ${compounds.length} compounds)`)
