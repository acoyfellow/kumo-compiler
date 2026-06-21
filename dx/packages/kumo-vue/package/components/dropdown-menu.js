import { defineComponent as _defineComponent } from "vue";
import { onMounted, ref } from "vue";
const modelDigest = "067c8530a8b7c49b56d39fe9649b03d5a722ce64bb0b9bc7226a6296da3b6f18";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "dropdown-menu",
  props: {
    CheckboxItem: { type: null, required: false },
    "Content/SubContent": { type: null, required: false },
    Item: { type: null, required: false },
    "Label/Separator/Shortcut/Group": { type: null, required: false },
    LinkItem: { type: null, required: false },
    "RadioGroup/RadioItem/RadioItemIndicator": { type: null, required: false },
    Root: { type: null, required: false },
    "Sub/SubTrigger": { type: null, required: false },
    Trigger: { type: null, required: false }
  },
  emits: ["update:open", "change"],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-dropdown-menu-root" };
    const highlightedItem = ref(void 0);
    const root = ref(null);
    onMounted(() => {
      void props;
    });
    const __returned__ = { modelDigest, props, emit, styles, highlightedItem, root };
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
      "data-kumo-compound": "dropdown-menu",
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
var dropdown_menu_default = __sfc__;
export {
  dropdown_menu_default as default,
  modelDigest
};
