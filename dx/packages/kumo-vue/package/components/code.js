import { defineComponent as _defineComponent } from "vue";
const modelDigest = "5e7c1a6e6d7b7973979fc806a00d8999299a443db7eda7b9234417bc397a0fba";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "code",
  props: {
    className: { type: String, required: false },
    code: { type: String, required: true },
    lang: { type: null, required: false, default: "ts" },
    style: { type: null, required: false },
    values: { type: null, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-code-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "code",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    _toDisplayString($setup.props.code),
    3
    /* TEXT, CLASS */
  );
}
__sfc__.render = render;
var code_default = __sfc__;
export {
  code_default as default,
  modelDigest
};
