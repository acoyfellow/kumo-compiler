import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "fba8232e14f886639f5b9cf04c6dd04fc1c8b09852cd5feefd379fda9ded0e30";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "autocomplete",
  props: {
    compound: { type: null, required: false },
    Content: { type: null, required: false },
    InputGroup: { type: null, required: false },
    root: { type: null, required: false }
  },
  emits: ["update:open", "update:value", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-autocomplete-root" };
    const highlight = ref(void 0);
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, highlight, root };
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
      "data-kumo-compound": "autocomplete",
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
var autocomplete_default = __sfc__;
export {
  autocomplete_default as default,
  modelDigest
};
