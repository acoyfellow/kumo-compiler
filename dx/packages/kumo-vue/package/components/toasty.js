import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "96819ff5ff77c94bea48a81f92da6a4857acc3495fbbd3f4eb7703e24db317d6";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "toasty",
  props: {
    children: { type: null, required: false },
    container: { type: null, required: false, default: "provider container or document.body" },
    toastManager: { type: null, required: false },
    variant: { type: null, required: false, default: "default" }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-toasty-root" };
    const viewport = ref(void 0);
    onMounted(() => {
      void globalThis;
    });
    const __returned__ = { modelDigest, props, emit, styles, viewport };
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
      "data-kumo-compound": "toasty",
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
var toasty_default = __sfc__;
export {
  toasty_default as default,
  modelDigest
};
