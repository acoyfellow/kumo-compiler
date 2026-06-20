/** Executable framework-neutral Select contract, version 1. */
export const SELECT_CONTRACT_VERSION = '1.0.0' as const;
export type SelectValue = string | null;
export type Ownership = 'controlled' | 'uncontrolled';
export interface SelectOptionInput { id: string; value: string; label: string; disabled?: boolean; order?: number }
export interface SelectOption { readonly id:string; readonly value:string; readonly label:string; readonly disabled:boolean; readonly order:number; readonly sequence:number }
export interface SelectConfig { idSeed:string; value?:SelectValue; defaultValue?:SelectValue; open?:boolean; defaultOpen?:boolean; disabled?:boolean; pageSize?:number; typeaheadTimeoutMs?:number }
export interface SelectState { readonly version:typeof SELECT_CONTRACT_VERSION; readonly ids:SelectIds; readonly options:readonly SelectOption[]; readonly value:SelectValue; readonly valueOwnership:Ownership; readonly open:boolean; readonly openOwnership:Ownership; readonly activeId:string|null; readonly typeahead:Readonly<{buffer:string;expiresAt:number|null}>; readonly disabled:boolean; readonly pageSize:number; readonly typeaheadTimeoutMs:number; readonly nextSequence:number }
export interface SelectIds { root:string; label:string; trigger:string; value:string; listbox:string; description:string; error:string; option:(optionId:string)=>string }
export type SelectKey='ArrowDown'|'ArrowUp'|'Home'|'End'|'PageDown'|'PageUp'|'Enter'|' '|'Escape'|'Tab';
export type SelectEvent =
 | {type:'register';option:SelectOptionInput}
 | {type:'unregister';id:string}
 | {type:'key';key:SelectKey;now:number}
 | {type:'typeahead';text:string;now:number}
 | {type:'select';id:string}
 | {type:'set-controlled-value';value:SelectValue}
 | {type:'set-controlled-open';open:boolean}
 | {type:'set-disabled';disabled:boolean}
 | {type:'clear-typeahead';now:number};
export type SelectEffect =
 | {type:'value-change';value:string;optionId:string}
 | {type:'open-change';open:boolean;reason:'keyboard'|'selection'|'escape'|'tab'}
 | {type:'focus';target:'trigger'|'listbox'}
 | {type:'scroll';optionId:string;alignment:'nearest'};
export interface Transition { readonly state:SelectState; readonly effects:readonly SelectEffect[] }
export interface ValidationIssue {path:string;message:string}
export interface SelectAria { label:{id:string}; trigger:{id:string;role:'combobox';'aria-expanded':boolean;'aria-controls':string;'aria-labelledby':string;'aria-describedby':string;'aria-activedescendant'?:string;'aria-disabled'?:true}; listbox:{id:string;role:'listbox';'aria-labelledby':string}; option:(option:SelectOption)=>{id:string;role:'option';'aria-selected':boolean;'aria-disabled'?:true} }
