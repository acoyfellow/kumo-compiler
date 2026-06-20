import React, {createContext, forwardRef, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, type Ref} from 'react';
import {createSelectState, selectAria, transition, type SelectConfig, type SelectEffect, type SelectEvent, type SelectKey, type SelectOptionInput, type SelectState, type SelectValue as SelectValueType} from '../../../select/index.js';

export interface SelectProps extends Omit<SelectConfig,'idSeed'> {
  id?: string;
  children: ReactNode;
  onValueChange?: (value:string)=>void;
  onOpenChange?: (open:boolean)=>void;
}
interface ContextValue {state:SelectState; send:(event:SelectEvent)=>void; register:(option:SelectOptionInput,node:HTMLElement|null)=>()=>void; triggerRef:React.RefObject<HTMLButtonElement|null>; listboxRef:React.RefObject<HTMLUListElement|null>}
const Context=createContext<ContextValue|null>(null);
const useSelect=()=>{const value=useContext(Context);if(!value)throw new Error('Select components must be rendered inside <Select>');return value};
const assignRef=<T,>(ref:Ref<T>|undefined,value:T|null)=>{if(typeof ref==='function')ref(value);else if(ref)ref.current=value};
const useMergedRef=<T,>(external:Ref<T>|undefined,internal:(node:T|null)=>void)=>useCallback((node:T|null)=>{assignRef(external,node);internal(node)},[external,internal]);
const isSelectKey=(key:string):key is SelectKey=>['ArrowDown','ArrowUp','Home','End','PageDown','PageUp','Enter',' ','Escape','Tab'].includes(key);

export function Select({id,value,defaultValue,open,defaultOpen,disabled,pageSize,typeaheadTimeoutMs,children,onValueChange,onOpenChange}:SelectProps){
  const generated=React.useId();
  const config=useRef({idSeed:id??generated,value,defaultValue,open,defaultOpen,disabled,pageSize,typeaheadTimeoutMs});
  const effects=useRef<readonly SelectEffect[]>([]), callbacks=useRef({onValueChange,onOpenChange});callbacks.current={onValueChange,onOpenChange};
  const [state,dispatch]=useReducer((current:SelectState,event:SelectEvent)=>{const result=transition(current,event);effects.current=result.effects;return result.state},config.current,createSelectState);
  const triggerRef=useRef<HTMLButtonElement>(null),listboxRef=useRef<HTMLUListElement>(null),nodes=useRef(new Map<string,HTMLElement>());
  const send=useCallback((event:SelectEvent)=>dispatch(event),[]);
  const register=useCallback((option:SelectOptionInput,node:HTMLElement|null)=>{if(node)nodes.current.set(option.id,node);dispatch({type:'register',option});return ()=>{nodes.current.delete(option.id);dispatch({type:'unregister',id:option.id})}},[]);
  useLayoutEffect(()=>{for(const effect of effects.current){if(effect.type==='focus')(effect.target==='trigger'?triggerRef.current:listboxRef.current)?.focus();else if(effect.type==='scroll')nodes.current.get(effect.optionId)?.scrollIntoView({block:effect.alignment});else if(effect.type==='value-change')callbacks.current.onValueChange?.(effect.value);else callbacks.current.onOpenChange?.(effect.open)}effects.current=[]},[state]);
  useEffect(()=>{if(value!==undefined)send({type:'set-controlled-value',value})},[value,send]);
  useEffect(()=>{if(open!==undefined)send({type:'set-controlled-open',open})},[open,send]);
  useEffect(()=>send({type:'set-disabled',disabled:disabled??false}),[disabled,send]);
  const context=useMemo(()=>({state,send,register,triggerRef,listboxRef}),[state,send,register]);
  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export const SelectLabel=forwardRef<HTMLLabelElement,HTMLAttributes<HTMLLabelElement>>(function SelectLabel(props,ref){const {state}=useSelect();return <label {...props} {...selectAria(state).label} ref={ref}/>});
export const SelectValue=forwardRef<HTMLSpanElement,HTMLAttributes<HTMLSpanElement>&{placeholder?:ReactNode}>(function SelectValue({placeholder,...props},ref){const {state}=useSelect();const selected=state.options.find(option=>option.value===state.value);return <span {...props} id={state.ids.value} ref={ref}>{selected?.label??placeholder}</span>});
export const SelectDescription=forwardRef<HTMLDivElement,HTMLAttributes<HTMLDivElement>>(function SelectDescription(props,ref){const {state}=useSelect();return <div {...props} id={state.ids.description} ref={ref}/>});
export const SelectTrigger=forwardRef<HTMLButtonElement,React.ButtonHTMLAttributes<HTMLButtonElement>>(function SelectTrigger({onKeyDown,onClick,...props},ref){const {state,send,triggerRef}=useSelect(),aria=selectAria(state).trigger;const merged=useMergedRef(ref,node=>{triggerRef.current=node});return <button type="button" {...props} {...aria} disabled={state.disabled} ref={merged} onClick={event=>{onClick?.(event);if(!event.defaultPrevented)send({type:'key',key:state.open?'Escape':'Enter',now:Date.now()})}} onKeyDown={event=>translateKey(event,onKeyDown,send)}/>});
const translateKey=(event:KeyboardEvent<HTMLElement>,handler:((event:any)=>void)|undefined,send:(event:SelectEvent)=>void)=>{handler?.(event);if(event.defaultPrevented)return;if(isSelectKey(event.key)){if(event.key!=='Tab')event.preventDefault();send({type:'key',key:event.key,now:Date.now()})}else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&!event.altKey)send({type:'typeahead',text:event.key,now:Date.now()})};
export const SelectListbox=forwardRef<HTMLUListElement,React.HTMLAttributes<HTMLUListElement>>(function SelectListbox({onKeyDown,hidden,...props},ref){const {state,send,listboxRef}=useSelect(),merged=useMergedRef(ref,node=>{listboxRef.current=node});return <ul {...props} {...selectAria(state).listbox} hidden={hidden??!state.open} tabIndex={-1} ref={merged} onKeyDown={event=>translateKey(event,onKeyDown,send)}/>});
export interface SelectOptionProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>,'id'> {id:string; value:string; label:string; disabled?:boolean; order?:number}
export const SelectOption=forwardRef<HTMLLIElement,SelectOptionProps>(function SelectOption({id,value,label,disabled=false,order,children,onClick,onMouseMove,...props},ref){const {state,send,register}=useSelect(),option=state.options.find(item=>item.id===id),cleanup=useRef<()=>void>(()=>{});const setNode=useCallback((node:HTMLLIElement|null)=>{cleanup.current();cleanup.current=node?register({id,value,label,disabled,order},node):()=>{}},[register,id,value,label,disabled,order]);useEffect(()=>()=>cleanup.current(),[]);const merged=useMergedRef(ref,setNode),aria=option?selectAria(state).option(option):{id:state.ids.option(id),role:'option' as const,'aria-selected':state.value===value};return <li {...props} {...aria} ref={merged} onMouseMove={event=>{onMouseMove?.(event)}} onClick={event=>{onClick?.(event);if(!event.defaultPrevented&&!disabled)send({type:'select',id})}}>{children??label}</li>});

export const selectReactBoundary={adaptationLines:58,owns:['context/hooks','refs','option lifecycle','DOM effects','event translation','prop synchronization','hydration-safe ids'],escapeHatches:[]} as const;
export type {SelectState,SelectValueType};
