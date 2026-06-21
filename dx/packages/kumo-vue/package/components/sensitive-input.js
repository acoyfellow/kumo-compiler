import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "9f0862f5064e4584c2616703c9f1cd80330b5ef71dee9361752cc32841164461";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "sensitive-input",
  props: {
    observable: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-sensitive-input-root" };
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "input",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    null,
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var sensitive_input_default = __sfc__;
export {
  sensitive_input_default as default,
  modelDigest
};
