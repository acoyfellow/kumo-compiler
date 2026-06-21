import { defineComponent as _defineComponent } from "vue";
const modelDigest = "67f224503fcce1b354d3848ac5a55b55587789af9fe0688a4849fef4ad5c8ec5";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "badge",
  props: {
    appearance: { type: null, required: false, default: "filled" },
    children: { type: null, required: true },
    className: { type: String, required: false },
    variant: { type: String, required: false, default: "primary" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-badge-root" };
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
var badge_default = __sfc__;
export {
  badge_default as default,
  modelDigest
};
