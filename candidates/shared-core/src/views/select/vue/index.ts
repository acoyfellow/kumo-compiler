import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
  type Ref,
  type VNode,
} from 'vue';
import {
  createSelectState,
  selectAria,
  transition,
  type SelectEffect,
  type SelectKey,
  type SelectOptionInput,
  type SelectState,
  type SelectValue,
} from '../../../select/index.js';

type Context = {
  state: Ref<SelectState>;
  trigger: Ref<HTMLElement | null>;
  listbox: Ref<HTMLElement | null>;
  dispatch: (event: Parameters<typeof transition>[1]) => void;
};
const selectKey: InjectionKey<Context> = Symbol('KumoSelect');
const useSelect = () => {
  const context = inject(selectKey);
  if (!context) throw new Error('Select components must be nested in KumoSelect');
  return context;
};
const key = (value: string): value is SelectKey => ['ArrowDown','ArrowUp','Home','End','PageDown','PageUp','Enter',' ','Escape','Tab'].includes(value);

export const KumoSelect = defineComponent({
  name: 'KumoSelect',
  props: {
    id: {type: String, required: true},
    value: {type: [String, null] as unknown as PropType<SelectValue>, default: undefined},
    defaultValue: {type: [String, null] as unknown as PropType<SelectValue>, default: undefined},
    open: {type: Boolean, default: undefined}, defaultOpen: {type: Boolean, default: undefined}, disabled: Boolean,
    pageSize: Number, typeaheadTimeoutMs: Number,
  },
  emits: {'update:value': (_: SelectValue) => true, 'update:open': (_: boolean) => true, change: (_: string) => true},
  setup(props, {slots, emit}) {
    const state = ref(createSelectState({idSeed: props.id, value: props.value, defaultValue: props.defaultValue, open: props.open, defaultOpen: props.defaultOpen, disabled: props.disabled, pageSize: props.pageSize, typeaheadTimeoutMs: props.typeaheadTimeoutMs}));
    const trigger = ref<HTMLElement | null>(null), listbox = ref<HTMLElement | null>(null);
    const run = (effects: readonly SelectEffect[]) => { for (const effect of effects) {
      if (effect.type === 'value-change') { emit('update:value', effect.value); emit('change', effect.value); }
      else if (effect.type === 'open-change') emit('update:open', effect.open);
      else if (effect.type === 'focus') queueMicrotask(() => (effect.target === 'trigger' ? trigger.value : listbox.value)?.focus());
      else if (typeof document !== 'undefined') queueMicrotask(() => document.getElementById(state.value.ids.option(effect.optionId))?.scrollIntoView({block: effect.alignment}));
    }};
    const dispatch: Context['dispatch'] = event => { const result = transition(state.value, event); state.value = result.state; run(result.effects); };
    provide(selectKey, {state, trigger, listbox, dispatch});
    watch(() => props.value, value => { if (state.value.valueOwnership === 'controlled') dispatch({type:'set-controlled-value', value: value ?? null}); });
    watch(() => props.open, open => { if (state.value.openOwnership === 'controlled' && open !== undefined) dispatch({type:'set-controlled-open', open}); });
    watch(() => props.disabled, disabled => dispatch({type:'set-disabled', disabled}));
    return () => slots.default?.({state: state.value});
  },
});

export const KumoSelectLabel = defineComponent({name:'KumoSelectLabel', setup(_, {slots}) { const {state} = useSelect(); return () => h('label', selectAria(state.value).label, slots.default?.()); }});
export const KumoSelectValue = defineComponent({name:'KumoSelectValue', props:{placeholder:String}, setup(props, {slots}) { const {state} = useSelect(); return () => { const option=state.value.options.find(x=>x.value===state.value.value); return h('span',{id:state.value.ids.value},slots.default?.({option}) ?? option?.label ?? props.placeholder ?? ''); }; }});
export const KumoSelectDescription = defineComponent({name:'KumoSelectDescription', setup(_, {slots}) { const {state}=useSelect(); return()=>h('span',{id:state.value.ids.description},slots.default?.()); }});
export const KumoSelectTrigger = defineComponent({name:'KumoSelectTrigger', setup(_, {slots}) { const c=useSelect(); return()=>h('button',{...selectAria(c.state.value).trigger,type:'button',disabled:c.state.value.disabled,ref:c.trigger,onKeydown:(e:KeyboardEvent)=>{if(key(e.key)){if(e.key!=='Tab')e.preventDefault();c.dispatch({type:'key',key:e.key,now:Date.now()});}},onClick:()=>c.dispatch({type:'key',key:c.state.value.open?'Escape':'Enter',now:Date.now()})},slots.default?.({open:c.state.value.open})); }});
export const KumoSelectListbox = defineComponent({name:'KumoSelectListbox', setup(_, {slots}) { const c=useSelect(); return()=>c.state.value.open?h('ul',{...selectAria(c.state.value).listbox,tabindex:-1,ref:c.listbox,onKeydown:(e:KeyboardEvent)=>{if(key(e.key)){if(e.key!=='Tab')e.preventDefault();c.dispatch({type:'key',key:e.key,now:Date.now()});}else if(e.key.length===1)c.dispatch({type:'typeahead',text:e.key,now:Date.now()});}},slots.default?.()):null; }});
export const KumoSelectOption = defineComponent({
  name:'KumoSelectOption', props:{id:{type:String,required:true},value:{type:String,required:true},label:{type:String,required:true},disabled:Boolean,order:Number},
  setup(props,{slots}) { const c=useSelect(); const register=()=>c.dispatch({type:'register',option:{id:props.id,value:props.value,label:props.label,disabled:props.disabled,order:props.order} as SelectOptionInput}); register(); watch(()=>[props.value,props.label,props.disabled,props.order],register); onBeforeUnmount(()=>c.dispatch({type:'unregister',id:props.id})); return()=>{const option=c.state.value.options.find(x=>x.id===props.id); if(!option)return null; return h('li',{...selectAria(c.state.value).option(option),onMousedown:(e:MouseEvent)=>e.preventDefault(),onClick:()=>c.dispatch({type:'select',id:props.id})},slots.default?.({selected:c.state.value.value===props.value,active:c.state.value.activeId===props.id}) ?? props.label);}; }
});

export const boundary = {nativeLines: 104, escapeHatches: []} as const;
export type SelectVueNode = VNode;
