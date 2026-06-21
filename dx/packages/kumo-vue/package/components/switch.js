import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "ed2dc968d94168f193e43c4ace0c4c5a0eef92e88c8bbe1a3e168bf1f2b424b9";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "switch",
  props: {
    checked: { type: Boolean, required: false, default: false },
    disabled: { type: Boolean, required: false, default: false },
    group: { type: null, required: false },
    label: { type: null, required: false },
    onCheckedChange: { type: null, required: false },
    size: { type: String, required: false, default: "base" }
  },
  emits: ["onCheckedChange", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-switch-root" };
    const controlled = ref(void 0);
    const __returned__ = { modelDigest, props, emit, styles, controlled };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "button",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    null,
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var switch_default = __sfc__;
export {
  switch_default as default,
  modelDigest
};
