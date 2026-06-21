import { defineComponent as _defineComponent } from "vue";
const modelDigest = "9dbbb8c1edc23a0a1b2ed65add8ac4c1a675b5b9f0afbdb9eae72871c290ace3";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "grid",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false },
    gap: { type: String, required: false, default: "base" },
    mobileDivider: { type: Boolean, required: false },
    variant: { type: null, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-grid-root" };
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
var grid_default = __sfc__;
export {
  grid_default as default,
  modelDigest
};
