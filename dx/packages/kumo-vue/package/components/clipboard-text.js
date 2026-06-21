import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "2519ce9397d7b2de6138a9f8fe7461e138cd766c9a39f7f25d1d4c84345f0d10";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "clipboard-text",
  props: {
    observable: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-clipboard-text-root" };
    const root = ref(null);
    onMounted(() => {
      void globalThis;
    });
    const __returned__ = { modelDigest, props, emit, styles, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { resolveComponent as _resolveComponent, normalizeClass as _normalizeClass, openBlock as _openBlock, createBlock as _createBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_clipboard_text = _resolveComponent("clipboard-text", true);
  return _openBlock(), _createBlock(_component_clipboard_text, {
    class: _normalizeClass([$setup.styles["root"]])
  }, null, 8, ["class"]);
}
__sfc__.render = render;
var clipboard_text_default = __sfc__;
export {
  clipboard_text_default as default,
  modelDigest
};
