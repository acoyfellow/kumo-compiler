import { defineComponent as _defineComponent } from "vue";
const modelDigest = "1cb602a165516ca01de95379b40403eb61ab498fa6557f44ddeb0f0f5d0d9e4f";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "breadcrumbs",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false },
    size: { type: String, required: false, default: "base" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-breadcrumbs-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "nav",
    {
      "aria-label": "Breadcrumbs",
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
var breadcrumbs_default = __sfc__;
export {
  breadcrumbs_default as default,
  modelDigest
};
