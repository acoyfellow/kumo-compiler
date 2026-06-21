import { defineComponent as _defineComponent } from "vue";
const modelDigest = "ce6505b3ce28964f1d8bb565e8a04a6c23ab186f8a5afc3a83dc631e65c3914e";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "surface",
  props: {
    as: { type: null, required: false },
    children: { type: null, required: false },
    className: { type: String, required: false },
    color: { type: String, required: false, default: "primary" },
    render: { type: null, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-surface-root" };
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
var surface_default = __sfc__;
export {
  surface_default as default,
  modelDigest
};
