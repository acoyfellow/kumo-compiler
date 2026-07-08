import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {digest} from './index.mjs';
import {buttonVariants} from '@cloudflare/kumo/components/button';

export const NATIVE_BUTTON_VERSION='kumo.native-button/v1';
const here=path.dirname(fileURLToPath(import.meta.url));

// Canonical Kumo variant prop values, in the order @cloudflare/kumo declares them.
// `danger` is an authored alias for `destructive` (same real Kumo danger classes).
const CANONICAL_VARIANTS=['primary','secondary','ghost','destructive','secondary-destructive','outline'];
const VARIANT_ALIASES={danger:'destructive'};
const DEFAULT_VARIANT='secondary';

// Canonical Kumo 2.6.0 button emphasis, transcribed from the shipped React chunk
// (@cloudflare/kumo dist/chunks/button-*.js helpers `S`, `T`, `L`). The emphasis
// variants render a colored, gradient-overlaid button by binding four inline CSS
// variables from a single tone token via `color-mix` (pure CSS, no runtime JS),
// which give the `bg-(--kumo-button-emphasis-bg)` / `ring-(--kumo-button-emphasis-ring)`
// utilities a value. `danger` is the authored alias for `destructive`.
// S(variant): the tone token per emphasis variant.
const EMPHASIS_TONES={primary:'var(--color-kumo-brand)',destructive:'var(--color-kumo-danger)',danger:'var(--color-kumo-danger)'};
// L(): gradient overlay span class + the relative wrapper that holds the label.
const EMPHASIS_OVERLAY_CLASS='absolute inset-0 rounded-[inherit] bg-linear-to-b from-(--kumo-button-emphasis-gradient-start) to-(--kumo-button-emphasis-gradient-end) translate-y-px group-hover:from-(--kumo-button-emphasis-bg)';
const EMPHASIS_WRAPPER_CLASS='relative flex items-center gap-1.5';
const EMPHASIS_VARS=['--kumo-button-emphasis-ring','--kumo-button-emphasis-bg','--kumo-button-emphasis-gradient-start','--kumo-button-emphasis-gradient-end'];
// T(tone): the four inline CSS variables derived from the tone via color-mix.
function emphasisStyle(tone){return {'--kumo-button-emphasis-ring':`color-mix(in oklch, ${tone}, black 10%)`,'--kumo-button-emphasis-bg':`color-mix(in oklch, ${tone}, white 30%)`,'--kumo-button-emphasis-gradient-start':`color-mix(in oklch, ${tone}, white 15%)`,'--kumo-button-emphasis-gradient-end':tone};}
function deriveEmphasis(){
  const variants=Object.fromEntries(Object.entries(EMPHASIS_TONES).map(([variant,tone])=>[variant,emphasisStyle(tone)]));
  return {prop:'variant',overlayClass:EMPHASIS_OVERLAY_CLASS,wrapperClass:EMPHASIS_WRAPPER_CLASS,variants};
}
// Real assertion coupling the emitted inline vars to the utility classes that
// reference them: every emphasis variant's canonical class string must carry the
// emphasis background+ring utilities, and the inline style must define each of the
// four `--kumo-button-emphasis-*` vars those utilities read. If upstream drops the
// emphasis token shape (or the emitter stops emitting the vars) this throws.
function assertEmphasisCoupling(styleVariants,emphasis){
  for(const variant of Object.keys(emphasis.variants)){
    const entry=styleVariants.find(item=>item.when.variant===variant);
    if(!entry)throw new Error(`native button emphasis drift: variant ${variant} has no style variant to couple`);
    for(const token of ['bg-(--kumo-button-emphasis-bg)','ring-(--kumo-button-emphasis-ring)'])if(!entry.classes.includes(token))throw new Error(`native button emphasis drift: variant ${variant} must include utility ${token}`);
    const style=emphasis.variants[variant];
    for(const cssVar of EMPHASIS_VARS)if(typeof style[cssVar]!=='string'||!style[cssVar])throw new Error(`native button emphasis drift: variant ${variant} missing inline var ${cssVar}`);
  }
}

// Derive the real per-variant class string straight from @cloudflare/kumo's
// canonical `buttonVariants` (the CVA-style variant->class map). Not faked,
// not inline styles, not invented: this is the same function React Kumo ships.
function deriveStyleVariants(contract){
  const styleVariants=CANONICAL_VARIANTS.map(variant=>({when:{variant},classes:buttonVariants({variant}).split(/\s+/).filter(Boolean)}));
  for(const [alias,target] of Object.entries(VARIANT_ALIASES))styleVariants.push({when:{variant:alias},classes:buttonVariants({variant:target}).split(/\s+/).filter(Boolean)});
  // Prove the emitted classes are the real Kumo tokens the contract asserts.
  // The variant-distinguishing background class is version-defined: 2.5.2 used
  // literal `bg-kumo-*` utilities, 2.6.0 uses the `bg-(--kumo-button-emphasis-*)`
  // CSS-variable tokens. Bind to whatever background class the (regenerated)
  // contract vector declares rather than a hardcoded token pattern, so the guard
  // keeps proving emitted==contract across upstream bumps instead of silently
  // going no-op when the token shape changes.
  const expected=new Map();
  for(const vector of contract.vectors){const v=vector.props?.variant;const inc=vector.expected?.root?.classes?.includes;if(v&&Array.isArray(inc))for(const cls of inc)if(cls.startsWith('bg-'))expected.set(v,cls);}
  if(!expected.size)throw new Error('native button styleVariants drift: contract declares no variant background class to verify');
  for(const [variant,cls] of expected){const entry=styleVariants.find(item=>item.when.variant===variant);if(!entry||!entry.classes.includes(cls))throw new Error(`native button styleVariants drift: variant ${variant} must include real Kumo class ${cls}`);}
  return styleVariants;
}

// Shape and size are additional CVA dimensions on the real Button. Rather than
// enumerate a 6x3x4 matrix, derive the CLASS DELTA each non-default shape/size
// contributes (straight from @cloudflare/kumo's buttonVariants, not invented):
// the emitter concatenates base variant classes + the active shape/size delta
// and the runtime cx()/tailwind-merge resolves the conflicts (size-9 beats
// w-max/h-9, p-0 beats px-3, etc.) to the exact computed style golden renders.
const CANONICAL_SHAPES=['base','square','circle'];
const CANONICAL_SIZES=['xs','sm','base','lg'];
const DEFAULT_SHAPE='base';
const DEFAULT_SIZE='base';
function deriveDimensionVariants(dimension,keys,defaultKey){
  const baseClasses=new Set(buttonVariants({variant:DEFAULT_VARIANT}).split(/\s+/).filter(Boolean));
  const out=[];
  for(const key of keys){
    if(key===defaultKey)continue;
    const full=buttonVariants({variant:DEFAULT_VARIANT,[dimension]:key}).split(/\s+/).filter(Boolean);
    const delta=full.filter(cls=>!baseClasses.has(cls));
    if(delta.length)out.push({when:{[dimension]:key},classes:delta});
  }
  return out;
}

export function deriveNativeButton(contract){
  if(contract.component!=='button'||contract.schemaVersion!=='kumo.observable/v1')throw new Error('native button capability requires canonical Button contract');
  const required=['disabled-click','loading-click','enabled-click','submit-form'];
  const ids=contract.vectors.map(vector=>vector.id);
  for(const id of required)if(!ids.includes(id))throw new Error(`native button vector missing: ${id}`);
  const styleVariants=deriveStyleVariants(contract);
  const shapeVariants=deriveDimensionVariants('shape',CANONICAL_SHAPES,DEFAULT_SHAPE);
  const sizeVariants=deriveDimensionVariants('size',CANONICAL_SIZES,DEFAULT_SIZE);
  const emphasis=deriveEmphasis();
  assertEmphasisCoupling(styleVariants,emphasis);
  const value={schemaVersion:NATIVE_BUTTON_VERSION,component:'button',root:'button',type:{prop:'type',default:'button'},content:{role:'consumer-content'},nativeAttributes:true,disabledWhen:[{prop:'disabled',equals:true},{prop:'loading',equals:true}],loadingIndicator:{when:{prop:'loading',equals:true},tag:'svg',attributes:{'aria-hidden':'true'},beforeContent:true},styleVariants,styleVariantProp:'variant',defaultVariant:DEFAULT_VARIANT,shapeVariants,shapeProp:'shape',defaultShape:DEFAULT_SHAPE,sizeVariants,sizeProp:'size',defaultSize:DEFAULT_SIZE,emphasis,events:{click:{native:true,suppressedWhen:['disabled','loading']},submit:{nativeForm:true,when:{prop:'type',equals:'submit'}}},vectorIds:required};
  return {...value,capabilityDigest:digest(value)};
}
export function validateNativeButton(value){
  if(value?.schemaVersion!==NATIVE_BUTTON_VERSION||value.component!=='button'||value.root!=='button')throw new Error('invalid native button capability');
  if(value.type?.prop!=='type'||value.type.default!=='button'||value.content?.role!=='consumer-content'||value.nativeAttributes!==true)throw new Error('invalid native button rendering contract');
  if(value.disabledWhen?.map(item=>item.prop).join(',')!=='disabled,loading'||value.loadingIndicator?.tag!=='svg')throw new Error('invalid native button state contract');
  if(!value.events?.click?.native||!value.events?.submit?.nativeForm||value.vectorIds?.length!==4)throw new Error('invalid native button event contract');
  if(!Array.isArray(value.styleVariants)||!value.styleVariants.length||value.styleVariantProp!=='variant'||!value.styleVariants.some(item=>item.when?.variant===value.defaultVariant&&Array.isArray(item.classes)&&item.classes.length))throw new Error('invalid native button style variant contract');
  const emphasis=value.emphasis;
  if(!emphasis||emphasis.prop!=='variant'||typeof emphasis.overlayClass!=='string'||!emphasis.overlayClass||typeof emphasis.wrapperClass!=='string'||!emphasis.wrapperClass||!emphasis.variants||typeof emphasis.variants!=='object')throw new Error('invalid native button emphasis contract');
  for(const [variant,style] of Object.entries(emphasis.variants)){if(!EMPHASIS_TONES[variant])throw new Error(`invalid native button emphasis variant: ${variant}`);for(const cssVar of EMPHASIS_VARS)if(typeof style?.[cssVar]!=='string'||!style[cssVar])throw new Error(`invalid native button emphasis style for ${variant}: ${cssVar}`);}
  assertEmphasisCoupling(value.styleVariants,emphasis);
  const {capabilityDigest,...unsigned}=value;if(capabilityDigest!==digest(unsigned))throw new Error('native button capability digest mismatch');return value;
}
export function loadNativeButton(file=path.join(here,'capabilities/native-button.json')){return validateNativeButton(JSON.parse(fs.readFileSync(file,'utf8')))}
