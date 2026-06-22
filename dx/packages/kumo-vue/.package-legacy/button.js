import { defineComponent, h } from "vue";
const Button = defineComponent({
  name: "KumoButton",
  inheritAttrs: false,
  props: {
    variant: { type: String, default: "primary" },
    size: { type: String, default: "medium" },
    disabled: Boolean,
    loading: Boolean,
    type: { type: String, default: "button" }
  },
  emits: ["click"],
  setup(props, { attrs, slots, emit }) {
    return () => h("button", {
      ...attrs,
      type: props.type,
      class: ["kumo-button", `kumo-button--${props.variant}`, `kumo-button--${props.size}`, attrs.class],
      disabled: props.disabled || props.loading,
      "aria-busy": props.loading || void 0,
      onClick: (event) => emit("click", event)
    }, props.loading ? slots.loading?.() ?? "Loading\u2026" : slots.default?.());
  }
});
export {
  Button
};

export default Button;
