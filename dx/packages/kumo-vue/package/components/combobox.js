import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "b431b499c0e47a951de0104395b33980461e37f3410131f5ddf2fc8c2223070f";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "combobox",
  props: {
    compound: { type: null, required: false },
    Content: { type: null, required: false },
    root: { type: null, required: false },
    TriggerInput: { type: null, required: false },
    TriggerMultipleWithInput: { type: null, required: false },
    variants: { type: String, required: false }
  },
  emits: ["update:open", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-combobox-root" };
    const multiple = ref(void 0);
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, multiple, root };
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
      "data-kumo-compound": "combobox",
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
var combobox_default = __sfc__;
export {
  combobox_default as default,
  modelDigest
};
