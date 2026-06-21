import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "480d0ca0dc8311b3321bb1c078c9277118ed399fcc4ececa5b561d5b695a3336";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "tabs",
  props: {
    activateOnFocus: { type: Boolean, required: false, default: false },
    className: { type: null, required: false },
    indicatorClassName: { type: null, required: false },
    listClassName: { type: null, required: false },
    onValueChange: { type: String, required: false },
    selectedValue: { type: String, required: false, default: "first tab value when uncontrolled and selectedValue omitted" },
    size: { type: String, required: false, default: "base" },
    tabs: { type: null, required: false, default: [] },
    value: { type: String, required: false },
    variant: { type: null, required: false, default: "segmented" }
  },
  emits: ["onValueChange", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-tabs-root" };
    const controlled = ref(void 0);
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, controlled, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = { "data-kumo-part": "root" };
const _hoisted_2 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
    {
      "data-kumo-compound": "tabs",
      class: _normalizeClass($setup.styles.root)
    },
    [
      _createElementVNode("section", _hoisted_1, [
        _renderSlot(_ctx.$slots, "root")
      ]),
      _createElementVNode("section", _hoisted_2, [
        _renderSlot(_ctx.$slots, "collection")
      ])
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var tabs_default = __sfc__;
export {
  tabs_default as default,
  modelDigest
};
