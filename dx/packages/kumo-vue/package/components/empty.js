import { defineComponent as _defineComponent } from "vue";
const modelDigest = "807df579a4b5811636f6c8ae3fbc56d8907ba572d3a57cf9b47ea9f266a81eca";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "empty",
  props: {
    className: { type: String, required: false },
    commandLine: { type: String, required: false },
    contents: { type: null, required: false },
    description: { type: String, required: false },
    icon: { type: null, required: false },
    size: { type: String, required: false, default: "base" },
    title: { type: String, required: true }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-empty-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "section",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    [
      _renderSlot(_ctx.$slots, "icon"),
      _createTextVNode(
        _toDisplayString($setup.props.title),
        1
        /* TEXT */
      ),
      _renderSlot(_ctx.$slots, "description"),
      _renderSlot(_ctx.$slots, "contents")
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var empty_default = __sfc__;
export {
  empty_default as default,
  modelDigest
};
