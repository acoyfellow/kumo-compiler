import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "12a3eb7f1d84d603ca914b803a794e948b5b62e88a1981d4ebb270f13b6bf69c";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "select",
  props: {
    "aria-label/aria-labelledby": { type: null, required: false },
    children: { type: null, required: false },
    container: { type: null, required: false },
    hideLabel: { type: Boolean, required: false },
    items: { type: null, required: false },
    label: { type: null, required: false },
    "labelTooltip/description/error": { type: null, required: false },
    "placeholder/loading/disabled/required": { type: null, required: false },
    renderValue: { type: null, required: false },
    Root: { type: null, required: false },
    size: { type: String, required: false, default: "base" }
  },
  emits: ["update:open", "update:value", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-select-root" };
    const highlightedOption = ref(void 0);
    const root = ref(null);
    onMounted(() => {
      void props;
    });
    const __returned__ = { modelDigest, props, emit, styles, highlightedOption, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = { "data-kumo-part": "root" };
const _hoisted_2 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "div",
    {
      "data-kumo-compound": "select",
      class: _normalizeClass($setup.styles.root)
    },
    [
      _createElementVNode("section", _hoisted_1, [
        _renderSlot(_ctx.$slots, "root")
      ]),
      _createElementVNode("section", _hoisted_2, [
        _renderSlot(_ctx.$slots, "collection")
      ])
    ],
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var select_default = __sfc__;
export {
  select_default as default,
  modelDigest
};
