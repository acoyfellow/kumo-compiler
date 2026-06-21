import { defineComponent as _defineComponent } from "vue";
const modelDigest = "60219ad3fa185b8a9db3e82cc4fc77b1b0683b2881bcf6b0460646bb320e67c2";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "text",
  props: {
    as: { type: null, required: false },
    bold: { type: Boolean, required: false, default: false },
    children: { type: null, required: false },
    DANGEROUS_className: { type: String, required: false },
    DANGEROUS_style: { type: null, required: false },
    size: { type: String, required: false, default: "base" },
    truncate: { type: Boolean, required: false, default: false },
    variant: { type: null, required: false, default: "body" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-text-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "span",
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
var text_default = __sfc__;
export {
  text_default as default,
  modelDigest
};
