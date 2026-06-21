import { defineComponent, h } from 'vue';

export const Field = defineComponent({
  name: 'KumoField',
  inheritAttrs: false,
  props: {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: String,
    error: String,
    required: Boolean,
    disabled: Boolean,
    modelValue: { type: [String, Number], default: '' }
  },
  emits: ['update:modelValue', 'input', 'change', 'focus', 'blur'],
  setup(props, { attrs, emit }) {
    return () => {
      const descriptionId = props.description ? `${props.id}-description` : undefined;
      const errorId = props.error ? `${props.id}-error` : undefined;
      const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;
      return h('div', { class: ['kumo-field', attrs.class] }, [
        h('label', { class: 'kumo-field__label', for: props.id }, [props.label, props.required ? h('span', { 'aria-hidden': 'true' }, ' *') : null]),
        props.description ? h('div', { class: 'kumo-field__description', id: descriptionId }, props.description) : null,
        h('input', {
          ...attrs,
          class: ['kumo-field__input', attrs.class],
          id: props.id,
          value: props.modelValue,
          required: props.required,
          disabled: props.disabled,
          'aria-invalid': props.error ? 'true' : undefined,
          'aria-describedby': describedBy,
          onInput: event => { emit('update:modelValue', event.target.value); emit('input', event); },
          onChange: event => emit('change', event),
          onFocus: event => emit('focus', event),
          onBlur: event => emit('blur', event)
        }),
        props.error ? h('div', { class: 'kumo-field__error', id: errorId, role: 'alert' }, props.error) : null
      ]);
    };
  }
});
