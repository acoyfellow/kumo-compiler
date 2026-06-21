import { defineComponent as _defineComponent } from "vue";
import { ref } from "vue";
const modelDigest = "0edcb3b93ae1bc7dcc9649eb23cbe160e99dff83a87d6a697762a867141a58a8";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "input-group",
  props: {
    observable: { type: null, required: false }
  },
  emits: ["change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-input-group-root" };
    const root = ref(null);
    const __returned__ = { modelDigest, props, emit, styles, root };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { resolveComponent as _resolveComponent, normalizeClass as _normalizeClass, openBlock as _openBlock, createBlock as _createBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_input_group = _resolveComponent("input-group", true);
  return _openBlock(), _createBlock(_component_input_group, {
    class: _normalizeClass([$setup.styles["root"]])
  }, null, 8, ["class"]);
}
__sfc__.render = render;
var input_group_default = __sfc__;
export {
  input_group_default as default,
  modelDigest
};
