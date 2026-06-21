import { defineComponent as _defineComponent } from "vue";
const modelDigest = "c6f0fbd6318e25df8755e6c0053fe1d74c23861e6bcc3f9256588ac62b9fa195";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "link",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false },
    href: { type: String, required: false },
    render: { type: null, required: false },
    variant: { type: null, required: false, default: "inline" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-link-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = ["href"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock("a", {
    href: $setup.props.href,
    class: _normalizeClass([$setup.styles["root"]])
  }, [
    _renderSlot(_ctx.$slots, "default")
  ], 10, _hoisted_1);
}
__sfc__.render = render;
var link_default = __sfc__;
export {
  link_default as default,
  modelDigest
};
