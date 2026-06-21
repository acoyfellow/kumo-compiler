import { defineComponent as _defineComponent } from "vue";
const modelDigest = "c5e7d6281fea509e18399d83a7768d4533db188cdb59ddc8cbf2f1bd99e0dec1";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "banner",
  props: {
    action: { type: null, required: false },
    children: { type: null, required: false },
    className: { type: String, required: false },
    description: { type: null, required: false },
    icon: { type: null, required: false },
    text: { type: String, required: false },
    title: { type: String, required: false },
    variant: { type: null, required: false, default: "default" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-banner-root" };
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
      _renderSlot(_ctx.$slots, "action"),
      _renderSlot(_ctx.$slots, "default")
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var banner_default = __sfc__;
export {
  banner_default as default,
  modelDigest
};
