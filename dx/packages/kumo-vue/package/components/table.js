import { defineComponent as _defineComponent } from "vue";
const modelDigest = "9d4b8d811da622ddf7ca92cd6b3f7e4f76e0d35094bab50ce0d03c2e4bde88ba";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "table",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false },
    layout: { type: null, required: false, default: "auto" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-table-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "table",
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
var table_default = __sfc__;
export {
  table_default as default,
  modelDigest
};
