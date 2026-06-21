import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "534bd5b5c6c38761249fe7fb50b9cc0cc672c5a25c4b72ab4e1808bb92d2dd29";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "command-palette",
  props: {
    compound: { type: null, required: false },
    Dialog: { type: null, required: false },
    Input: { type: null, required: false },
    Panel: { type: String, required: false },
    Root: { type: String, required: false }
  },
  emits: ["update:open", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-command-palette-root" };
    const modal = ref(true);
    const root = ref(null);
    onMounted(() => {
      void props;
    });
    const __returned__ = { modelDigest, props, emit, styles, modal, root };
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
      "data-kumo-compound": "command-palette",
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
var command_palette_default = __sfc__;
export {
  command_palette_default as default,
  modelDigest
};
