export const IR_SCHEMA_VERSION = 'kumo.ir/v1' as const;
export type Primitive = string | number | boolean;
export interface ElementNode { kind:'element'; tag:string; attrs?:Record<string, Primitive>; children?:Node[] }
export interface TextNode { kind:'text'; value:string }
export type Node = ElementNode | TextNode;
export type FormBehavior =
 | {kind:'sensitive-toggle'; inputId:string; buttonClass:string}
 | {kind:'clipboard-copy'; inputId:string; buttonClass:string; statusClass:string; message:string};
export interface ComponentIR { schemaVersion:typeof IR_SCHEMA_VERSION; id:string; name:string; family:string; root:ElementNode|null; behavior?:FormBehavior; source:{kind:'normalized-ir'; revision:string}; migration:{vue:'pending'|'candidate'|'verified'} }
export interface Provenance { schemaVersion:typeof IR_SCHEMA_VERSION; component:string; framework:'vue'; sourceHash:string; irHash:string; emitterHash:string; outputs:Record<string,string> }
