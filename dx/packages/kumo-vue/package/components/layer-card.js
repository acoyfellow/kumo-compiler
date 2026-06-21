import { defineComponent as _defineComponent } from "vue";
const modelDigest = "c9dad696330b10c952f02f411171c962c2770f5c4b53cf81713d0397ef61abf8";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "layer-card",
  props: {
    children: { type: null, required: false },
    className: { type: String, required: false },
    render: { type: null, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-layer-card-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
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
var layer_card_default = __sfc__;
export {
  layer_card_default as default,
  modelDigest
};
