import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "fe575b56fa0db80a1e83a5b6976f0303f63a8f6ab45de9ba8f5abfb19d9a935f";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "checkbox",
  props: {
    checked: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false },
    group: { type: null, required: false },
    indeterminate: { type: Boolean, required: false, default: false },
    label: { type: null, required: false },
    onCheckedChange: { type: null, required: false }
  },
  emits: ["onCheckedChange", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-checkbox-root" };
    const controlled = ref(void 0);
    const __returned__ = { modelDigest, props, emit, styles, controlled };
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
var checkbox_default = __sfc__;
export {
  checkbox_default as default,
  modelDigest
};
