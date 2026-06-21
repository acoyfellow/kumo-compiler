import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "59711469ba9cb63d7177a2ef83d87ae8fdd8835dab30e06846284b0d7497f1c1";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "input-area",
  props: {
    observable: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-input-area-root" };
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "textarea",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    null,
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var input_area_default = __sfc__;
export {
  input_area_default as default,
  modelDigest
};
