import {createContext, createEffect, createMemo, createSignal, onCleanup, onMount, splitProps, useContext, type JSX, type ParentProps} from 'solid-js';
import {createSelectState, selectAria, transition, type SelectConfig, type SelectEffect, type SelectKey, type SelectOptionInput, type SelectState, type SelectValue} from '../../../select/index.js';

export interface SelectRootProps extends ParentProps, Omit<SelectConfig,'idSeed'> {
  id?: string;
  onValueChange?: (value:string, optionId:string)=>void;
  onOpenChange?: (open:boolean, reason:'keyboard'|'selection'|'escape'|'tab')=>void;
}
interface ContextValue {
  state:()=>SelectState;
  send:(event:Parameters<typeof transition>[1])=>void;
  register:(option:SelectOptionInput, element?:HTMLElement)=>void;
  unregister:(id:string)=>void;
  trigger:(element:HTMLButtonElement)=>void;
  listbox:(element:HTMLUListElement)=>void;
}
const SelectContext=createContext<ContextValue>();
const useSelect=()=>{const value=useContext(SelectContext);if(!value)throw new Error('Select components must be inside Select.Root');return value};
let nextId=0;
const keyboardKeys=new Set<SelectKey>(['ArrowDown','ArrowUp','Home','End','PageDown','PageUp','Enter',' ','Escape','Tab']);

export function Root(props:SelectRootProps):JSX.Element {
  const [local,rest]=splitProps(props,['id','value','defaultValue','open','defaultOpen','disabled','pageSize','typeaheadTimeoutMs','onValueChange','onOpenChange','children']);
  const seed=local.id??`solid-${++nextId}`;
  const [state,setState]=createSignal(createSelectState({idSeed:seed,value:local.value,defaultValue:local.defaultValue,open:local.open,defaultOpen:local.defaultOpen,disabled:local.disabled,pageSize:local.pageSize,typeaheadTimeoutMs:local.typeaheadTimeoutMs}));
  let triggerElement:HTMLButtonElement|undefined, listboxElement:HTMLUListElement|undefined;
  const optionElements=new Map<string,HTMLElement>();
  const effects=(items:readonly SelectEffect[])=>queueMicrotask(()=>{for(const item of items){
    if(item.type==='value-change')local.onValueChange?.(item.value,item.optionId);
    else if(item.type==='open-change')local.onOpenChange?.(item.open,item.reason);
    else if(item.type==='focus')(item.target==='trigger'?triggerElement:listboxElement)?.focus();
    else optionElements.get(item.optionId)?.scrollIntoView({block:item.alignment});
  }});
  const send:ContextValue['send']=event=>{const result=transition(state(),event);setState(result.state);effects(result.effects)};
  createEffect(()=>{const value=local.value;if(value!==undefined&&value!==state().value)send({type:'set-controlled-value',value})});
  createEffect(()=>{const open=local.open;if(open!==undefined&&open!==state().open)send({type:'set-controlled-open',open})});
  createEffect(()=>{const disabled=local.disabled??false;if(disabled!==state().disabled)send({type:'set-disabled',disabled})});
  const context:ContextValue={state,send,register:(option,element)=>{if(element)optionElements.set(option.id,element);send({type:'register',option})},unregister:id=>{optionElements.delete(id);send({type:'unregister',id})},trigger:element=>triggerElement=element,listbox:element=>listboxElement=element};
  return <SelectContext.Provider value={context}><div {...rest} id={state().ids.root} data-kumo-select="">{local.children}</div></SelectContext.Provider>;
}

export function Label(props:JSX.LabelHTMLAttributes<HTMLLabelElement>):JSX.Element {const context=useSelect();return <label {...props} id={context.state().ids.label}/>}
export function Description(props:JSX.HTMLAttributes<HTMLDivElement>):JSX.Element {const context=useSelect();return <div {...props} id={context.state().ids.description}/>}
export function Value(props:JSX.HTMLAttributes<HTMLSpanElement>):JSX.Element {const context=useSelect();const text=createMemo(()=>context.state().options.find(option=>option.value===context.state().value)?.label);return <span {...props} id={context.state().ids.value}>{props.children??text()}</span>}
export function Trigger(props:JSX.ButtonHTMLAttributes<HTMLButtonElement>):JSX.Element {
  const context=useSelect(); const aria=createMemo(()=>selectAria(context.state()).trigger);
  const keydown:JSX.EventHandler<HTMLButtonElement,KeyboardEvent>=event=>{if(typeof props.onKeyDown==='function')props.onKeyDown(event);if(event.defaultPrevented)return;if(keyboardKeys.has(event.key as SelectKey)){if(event.key!=='Tab')event.preventDefault();context.send({type:'key',key:event.key as SelectKey,now:Date.now()})}else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)context.send({type:'typeahead',text:event.key,now:Date.now()})};
  const click:JSX.EventHandler<HTMLButtonElement,MouseEvent>=event=>{if(typeof props.onClick==='function')props.onClick(event);if(!event.defaultPrevented)context.send({type:'key',key:context.state().open?'Escape':'Enter',now:Date.now()})};
  return <button {...props} {...aria()} type={props.type??'button'} disabled={context.state().disabled} ref={element=>context.trigger(element)} onKeyDown={keydown} onClick={click}/>;
}
export function Listbox(props:JSX.HTMLAttributes<HTMLUListElement>):JSX.Element {
  const context=useSelect();const aria=createMemo(()=>selectAria(context.state()).listbox);
  const keydown:JSX.EventHandler<HTMLUListElement,KeyboardEvent>=event=>{if(typeof props.onKeyDown==='function')props.onKeyDown(event);if(event.defaultPrevented)return;if(keyboardKeys.has(event.key as SelectKey)){if(event.key!=='Tab')event.preventDefault();context.send({type:'key',key:event.key as SelectKey,now:Date.now()})}else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)context.send({type:'typeahead',text:event.key,now:Date.now()})};
  return <ul {...props} {...aria()} hidden={!context.state().open} tabIndex={props.tabIndex??-1} ref={element=>context.listbox(element)} onKeyDown={keydown}/>;
}
export interface OptionProps extends Omit<JSX.LiHTMLAttributes<HTMLLIElement>,'id'> {id:string;value:string;label?:string;disabled?:boolean;order?:number}
export function Option(props:OptionProps):JSX.Element {
  const context=useSelect();const [local,rest]=splitProps(props,['id','value','label','disabled','order','children','onClick']);let element!:HTMLLIElement;
  const input=():SelectOptionInput=>({id:local.id,value:local.value,label:local.label??String(local.children??local.value),disabled:local.disabled,order:local.order});
  context.register(input());
  onMount(()=>context.register(input(),element));onCleanup(()=>context.unregister(local.id));
  createEffect(()=>{local.value;local.label;local.disabled;local.order;if(element)context.register(input(),element)});
  const option=createMemo(()=>context.state().options.find(item=>item.id===local.id)??input());const aria=createMemo(()=>selectAria(context.state()).option(option()));
  const click:JSX.EventHandler<HTMLLIElement,MouseEvent>=event=>{if(typeof local.onClick==='function')local.onClick(event);if(!event.defaultPrevented)context.send({type:'select',id:local.id})};
  return <li {...rest} {...aria()} ref={element} onClick={click}>{local.children??local.label}</li>;
}

export const Select={Root,Label,Description,Value,Trigger,Listbox,Option};
export const boundary={nativeLines:94,escapeHatches:[],core:'src/select/v1'} as const;
