import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "40c08fc1e03b3a7d723ec35135cb4cf3a2605d12368398588dcda6818ce453ea";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "menu-bar",
  props: {
    className: { type: String, required: false },
    isActive: { type: Boolean, required: false },
    optionIds: { type: Boolean, required: false, default: false },
    options: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-menu-bar-root" };
    const focus = ref(void 0);
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, focus, root };
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
      "data-kumo-compound": "menu-bar",
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
var menu_bar_default = __sfc__;
export {
  menu_bar_default as default,
  modelDigest
};
