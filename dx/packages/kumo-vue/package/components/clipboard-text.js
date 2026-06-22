import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "b0a8634b18904bafb4a3ad9eb78bc40c9142397d8869bcc94a88c6a372265e25";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'clipboard-text',
    props: {
        observable: { type: null, required: false },
        text: { type: null, required: false },
        textToCopy: { type: null, required: false },
        fixture: { type: null, required: false },
        semanticContent: { type: null, required: false }
    },
    setup(__props, { expose: __expose }) {
        __expose();
        const props = __props;
        const slots = useSlots();
        const styles = {};
        const normalizeSlotContent = (value) => Array.isArray(value) ? value.map(normalizeSlotContent).join('') : value == null || typeof value === 'boolean' ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : normalizeSlotContent(value.children);
        const renderContent = () => props.semanticContent ?? normalizeSlotContent(slots.default?.());
        const fixture = computed(() => props.fixture);
        const semanticValues = Object.assign({}, useAttrs(), props);
        const semanticEqual = (left, right) => JSON.stringify(left) === JSON.stringify(right);
        const fixtureText = (value) => value && typeof value === 'object' ? String(typeof value.text === 'string' ? value.text : '') + (Array.isArray(value.children) ? value.children.map(fixtureText).join('') : '') : '';
        const __returned__ = { modelDigest, contentBindingDigest, props, slots, styles, normalizeSlotContent, renderContent, fixture, semanticValues, semanticEqual, fixtureText };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});
import { openBlock as _openBlock, createElementBlock as _createElementBlock, resolveComponent as _resolveComponent, normalizeClass as _normalizeClass, createBlock as _createBlock } from "vue";
const _hoisted_1 = { key: 0 };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_clipboard_text = _resolveComponent("clipboard-text", true);
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "text") && $setup.semanticEqual($setup.semanticValues.text, "visible") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "textToCopy") && $setup.semanticEqual($setup.semanticValues.textToCopy, "payload"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1))
        : (_openBlock(), _createBlock(_component_clipboard_text, {
            key: 1,
            class: _normalizeClass([$setup.styles["root"]])
        }, null, 8 /* PROPS */, ["class"]));
}
__sfc__.render = render;
__sfc__.name = "clipboard-text";
__sfc__.__file = "components/clipboard-text.vue";
export default __sfc__;

export { __sfc__ as ClipboardText }
