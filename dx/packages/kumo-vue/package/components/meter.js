import { defineComponent as _defineComponent } from "vue";
const modelDigest = "2201de1a1ed8a66d0925c6dae8b6b3197097ad332ed86e9b694f8d7383c8c284";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "meter",
  props: {
    className: { type: String, required: false },
    customValue: { type: String, required: false },
    indicatorClassName: { type: String, required: false },
    label: { type: String, required: true },
    max: { type: Number, required: false, default: 100 },
    min: { type: Number, required: false, default: 0 },
    showValue: { type: Boolean, required: false, default: true },
    trackClassName: { type: String, required: false },
    value: { type: Number, required: false }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-meter-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { toDisplayString as _toDisplayString, normalizeClass as _normalizeClass, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
    {
      class: _normalizeClass([$setup.styles["root"]])
    },
    [
      _createTextVNode(
        _toDisplayString($setup.props.label),
        1
        /* TEXT */
      ),
      _createElementVNode(
        "meter",
        {
          class: _normalizeClass([$setup.styles["root"]])
        },
        null,
        2
        /* CLASS */
      ),
      $setup.props.showValue ? (_openBlock(), _createElementBlock(
        _Fragment,
        { key: 0 },
        [
          _createTextVNode(
            _toDisplayString($setup.props.customValue ?? $setup.props.value),
            1
            /* TEXT */
          )
        ],
        64
        /* STABLE_FRAGMENT */
      )) : _createCommentVNode("v-if", true)
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var meter_default = __sfc__;
export {
  meter_default as default,
  modelDigest
};
