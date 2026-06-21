import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "efe6ee1704bcfdd921aefd2a33601d5193d45c82454eadc21af9261b848e1bc6";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "date-picker",
  props: {
    "aria-label": { type: String, required: false },
    fromDate: { type: null, required: false },
    mode: { type: null, required: false },
    onChange: { type: null, required: false },
    reactDayPickerProps: { type: null, required: false },
    selected: { type: null, required: false },
    toDate: { type: null, required: false }
  },
  emits: ["onChange", "update:selected", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-date-picker-root" };
    const selected = ref(void 0);
    const __returned__ = { modelDigest, props, emit, styles, selected };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, openBlock as _openBlock, createBlock as _createBlock } from "vue";
const _hoisted_1 = { "data-kumo-layer": "date-picker" };
const _hoisted_2 = { "data-kumo-part": "date-picker" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createBlock(_Teleport, { to: "document-body" }, [
    _createElementVNode("div", _hoisted_1, [
      _createElementVNode(
        "div",
        {
          "data-kumo-compound": "date-picker",
          class: _normalizeClass($setup.styles.root)
        },
        [
          _createElementVNode("section", _hoisted_2, [
            _renderSlot(_ctx.$slots, "date-picker")
          ])
        ],
        2
        /* CLASS */
      )
    ])
  ]);
}
__sfc__.render = render;
var date_picker_default = __sfc__;
export {
  date_picker_default as default,
  modelDigest
};
