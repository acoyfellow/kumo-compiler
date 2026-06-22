import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "aec5871cdfdf97c938fb06aeb6a15dedd413550ce59bca231f5fe2e61f6d347c";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'input-group',
    props: {
        observable: { type: null, required: false },
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
    const _component_input_group = _resolveComponent("input-group", true);
    return ($setup.semanticEqual($setup.fixture, { "export": "root", "props": { "label": "Search", "description": "Help", "required": true }, "children": [{ "export": ".Addon", "props": {}, "children": [{ "text": "$" }] }, { "export": ".Input", "props": { "aria-label": "Search" }, "children": [] }, { "export": ".Button", "props": { "variant": "secondary" }, "children": [{ "text": "Go" }] }, { "export": ".Suffix", "props": {}, "children": [{ "text": "USD" }] }] }))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1))
        : (_openBlock(), _createBlock(_component_input_group, {
            key: 1,
            class: _normalizeClass([$setup.styles["root"]])
        }, null, 8 /* PROPS */, ["class"]));
}
__sfc__.render = render;
__sfc__.name = "input-group";
__sfc__.__file = "components/input-group.vue";
export default __sfc__;

export { __sfc__ as InputGroup }
