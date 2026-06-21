import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "a14b8ca4ef389e6247d422e71305289cda06eeb21a5ec5a1f49f196a6cca012f";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "label",
  props: {
    asContent: { type: Boolean, required: false, default: false },
    children: { type: null, required: true },
    className: { type: String, required: false },
    htmlFor: { type: String, required: false },
    showOptional: { type: Boolean, required: false, default: false },
    tooltip: { type: null, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-label-root" };
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "label",
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
var label_default = __sfc__;
export {
  label_default as default,
  modelDigest
};
