import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "24c51f801cb83e8ae05a575e5e3e012c1f46065f0d1fda618759efe36487bc38";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "date-range-picker",
  props: {
    className: { type: String, required: false },
    onEndDateChange: { type: null, required: false },
    onStartDateChange: { type: null, required: false },
    size: { type: String, required: false, default: "base" },
    timezone: { type: String, required: false, default: "New York, NY, USA (GMT-4)" },
    variant: { type: null, required: false, default: "default" }
  },
  emits: ["onEndDateChange", "onStartDateChange", "update:endDate", "update:startDate", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-date-range-picker-root" };
    const months = ref(void 0);
    const __returned__ = { modelDigest, props, emit, styles, months };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, openBlock as _openBlock, createBlock as _createBlock } from "vue";
const _hoisted_1 = { "data-kumo-layer": "date-range-picker" };
const _hoisted_2 = { "data-kumo-part": "date-range-picker" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createBlock(_Teleport, { to: "document-body" }, [
    _createElementVNode("div", _hoisted_1, [
      _createElementVNode(
        "div",
        {
          "data-kumo-compound": "date-range-picker",
          class: _normalizeClass($setup.styles.root)
        },
        [
          _createElementVNode("section", _hoisted_2, [
            _renderSlot(_ctx.$slots, "date-range-picker")
          ])
        ],
        2
        /* CLASS */
      )
    ])
  ]);
}
__sfc__.render = render;
var date_range_picker_default = __sfc__;
export {
  date_range_picker_default as default,
  modelDigest
};
