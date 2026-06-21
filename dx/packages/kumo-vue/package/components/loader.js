import { defineComponent as _defineComponent } from "vue";
const modelDigest = "8c761d6a326088b816393ffb81fd67e64ad97a3299d323ad3078a93acebc0730";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "loader",
  props: {
    "aria-label": { type: String, required: false, default: "Loading" },
    className: { type: String, required: false },
    size: { type: Number, required: false, default: "base" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-loader-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = ["aria-label"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock("span", {
    role: "status",
    "aria-label": $setup.props.aria_label,
    class: _normalizeClass([$setup.styles["root"]])
  }, null, 10, _hoisted_1);
}
__sfc__.render = render;
var loader_default = __sfc__;
export {
  loader_default as default,
  modelDigest
};
