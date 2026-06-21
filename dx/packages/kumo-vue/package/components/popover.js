import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "7ba76baf0b210a7f5fcc8c192377afd244248598bb69b0a67e5d03b53c7fb59a";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "popover",
  props: {
    Close: { type: null, required: false },
    Content: { type: null, required: false },
    Root: { type: null, required: false },
    "Title/Description": { type: null, required: false },
    Trigger: { type: null, required: false }
  },
  emits: ["update:open", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-popover-root" };
    const focus = ref(void 0);
    onMounted(() => {
      void globalThis;
    });
    const __returned__ = { modelDigest, props, emit, styles, focus };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, openBlock as _openBlock, createBlock as _createBlock } from "vue";
const _hoisted_1 = { "data-kumo-layer": "popover" };
const _hoisted_2 = { "data-kumo-part": "popover" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createBlock(_Teleport, { to: "document-body" }, [
    _createElementVNode("div", _hoisted_1, [
      _createElementVNode(
        "div",
        {
          "data-kumo-compound": "popover",
          class: _normalizeClass($setup.styles.root)
        },
        [
          _createElementVNode("section", _hoisted_2, [
            _renderSlot(_ctx.$slots, "popover")
          ])
        ],
        2
        /* CLASS */
      )
    ])
  ]);
}
__sfc__.render = render;
var popover_default = __sfc__;
export {
  popover_default as default,
  modelDigest
};
