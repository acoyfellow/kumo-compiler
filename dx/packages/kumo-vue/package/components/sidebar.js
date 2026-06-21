import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "82a1db07c782ac79373452b65cf7a972c8a0ea464dda72ff3fb69e7091df72c5";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "sidebar",
  props: {
    Collapsible: { type: null, required: false },
    CollapsibleTrigger: { type: null, required: false },
    MenuButton: { type: null, required: false },
    MenuSubButton: { type: null, required: false },
    Provider: { type: null, required: false },
    root: { type: null, required: false },
    SlidingView: { type: null, required: false },
    SlidingViews: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-sidebar-root" };
    const isPeeking = ref(false);
    const root = ref(null);
    onMounted(() => {
      void globalThis;
    });
    const __returned__ = { modelDigest, props, emit, styles, isPeeking, root };
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
      "data-kumo-compound": "sidebar",
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
var sidebar_default = __sfc__;
export {
  sidebar_default as default,
  modelDigest
};
