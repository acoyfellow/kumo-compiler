export const IR_SCHEMA_VERSION = 'kumo.ir/v1' as const;
export type Primitive = string | number | boolean;
export interface ElementNode { kind:'element'; tag:string; attrs?:Record<string, Primitive>; children?:Node[] }
export interface TextNode { kind:'text'; value:string }
export type Node = ElementNode | TextNode;
export type Behavior =
 | {kind:'sensitive-toggle'; inputId:string; buttonClass:string}
 | {kind:'clipboard-copy'; inputId:string; buttonClass:string; statusClass:string; message:string}
 | {kind:'native-check'; inputIds:string[]}
 | {kind:'roving'; groupRole:'tablist'|'menubar'; itemRole:'tab'|'menuitem'; labels:string[]; selection:'activation'|'focus'}
 | {kind:'current-link'; current:'page'|'location'; labels:string[]}
 | {kind:'selection'; mode:'radio'|'autocomplete'|'combobox'|'command'|'date'|'date-range'|'menu'|'toast'|'pagination'; options?:string[]; initial?:string|string[]|number}
 | {kind:'select'; options:string[]; sizes:string[]; variants:string[]}
 | {kind:'button'; sizes:string[]; variants:string[]}
 | {kind:'dialog'; sizes:string[]}
 | {kind:'popover'; sides:string[]; aligns:string[]};
export interface InteractionPolicy {state:string[]; events:string[]; keyboard:string[]; aria:string[]; hydration:'ssr-identical'}
export interface ComponentIR { schemaVersion:typeof IR_SCHEMA_VERSION; id:string; name:string; family:string; root:ElementNode|null; behavior?:Behavior; policy?:InteractionPolicy; source:{kind:'normalized-ir'; revision:string}; migration:{vue:'pending'|'candidate'|'verified'} }
export interface Provenance { schemaVersion:typeof IR_SCHEMA_VERSION; component:string; framework:'vue'|'svelte'|'solid'; sourceHash:string; irHash:string; emitterHash:string; outputs:Record<string,string> }
