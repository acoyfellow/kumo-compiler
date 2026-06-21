import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "0f71542a2bd3b8e5809f5dbb979a7fe2448e19e4f007cced41a22cbc5ef4cba9";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "radio",
  props: {
    defaultValue: { type: String, required: false },
    disabled: { type: Boolean, required: false },
    items: { type: null, required: false },
    onValueChange: { type: null, required: false },
    orientation: { type: null, required: false, default: "vertical" },
    value: { type: String, required: false }
  },
  emits: ["onValueChange", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-radio-root" };
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
      "data-kumo-compound": "radio",
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
var radio_default = __sfc__;
export {
  radio_default as default,
  modelDigest
};
