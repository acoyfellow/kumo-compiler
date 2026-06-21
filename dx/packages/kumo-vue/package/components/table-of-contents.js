import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "e48b4239cfca5e769df53ef328dfaf3f910bf892b503c032b84e02002bb57789";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "table-of-contents",
  props: {
    Group: { type: null, required: false },
    Item: { type: Boolean, required: false },
    List: { type: null, required: false },
    root: { type: null, required: false },
    Title: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-table-of-contents-root" };
    const active = ref(void 0);
    const __returned__ = { modelDigest, props, emit, styles, active };
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
      "data-kumo-compound": "table-of-contents",
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
var table_of_contents_default = __sfc__;
export {
  table_of_contents_default as default,
  modelDigest
};
