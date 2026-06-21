import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "b69b28139a711d8e96dd6ddf236811e0a1c5d9510c961808f6912e09a2d48997";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "dialog",
  props: {
    Close: { type: null, required: false },
    Description: { type: null, required: false },
    Dialog: { type: null, required: false },
    Root: { type: String, required: false },
    Title: { type: null, required: false },
    Trigger: { type: null, required: false }
  },
  emits: ["update:open", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-dialog-root" };
    const role = ref(void 0);
    const root = ref(null);
    onMounted(() => {
      void props;
    });
    const __returned__ = { modelDigest, props, emit, styles, role, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, openBlock as _openBlock, createBlock as _createBlock } from "vue";
const _hoisted_1 = { "data-kumo-layer": "dialog" };
const _hoisted_2 = { "data-kumo-part": "dialog" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createBlock(_Teleport, { to: "document-body" }, [
    _createElementVNode("div", _hoisted_1, [
      _createElementVNode(
        "div",
        {
          "data-kumo-compound": "dialog",
          class: _normalizeClass($setup.styles.root)
        },
        [
          _createElementVNode("section", _hoisted_2, [
            _renderSlot(_ctx.$slots, "dialog")
          ])
        ],
        2
        /* CLASS */
      )
    ])
  ]);
}
__sfc__.render = render;
var dialog_default = __sfc__;
export {
  dialog_default as default,
  modelDigest
};
