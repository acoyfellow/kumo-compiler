import { defineComponent as _defineComponent } from "vue";
const modelDigest = "914b6bbf31750fa0d8ea618a40c6abab812fc940fed7557bc9b8630e58fe76d7";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "grid-item",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-grid-item-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    [
      _renderSlot(_ctx.$slots, "default")
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var grid_item_default = __sfc__;
export {
  grid_item_default as default,
  modelDigest
};
