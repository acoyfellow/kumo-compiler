import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "8a03b02a4e86e5ee4971e869b775b7efd73bc7e61116c5e794612f2402b7dd2d";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "pagination",
  props: {
    compound: { type: null, required: false },
    controls: { type: null, required: false, default: "full" },
    labels: { type: null, required: false, default: "English canonical labels" },
    page: { type: Number, required: false, default: 1 },
    pageSelector: { type: null, required: false, default: "input" },
    perPage: { type: Number, required: false },
    setPage: { type: null, required: false },
    totalCount: { type: Number, required: false }
  },
  emits: ["update:page", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-pagination-root" };
    const editingPage = ref(void 0);
    onMounted(() => {
      void globalThis;
    });
    const __returned__ = { modelDigest, props, emit, styles, editingPage };
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
      "data-kumo-compound": "pagination",
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
var pagination_default = __sfc__;
export {
  pagination_default as default,
  modelDigest
};
