import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "abe340a97570aaf2d55b46c6015819101f40daa70452db116f62bad2a5ff7ced";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'code',
    props: {
        className: { type: String, required: false },
        code: { type: String, required: true },
        lang: { type: null, required: false, default: "ts" },
        style: { type: null, required: false },
        values: { type: null, required: false },
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
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "custom font-mono"
};
const _hoisted_2 = {
    key: 1,
    class: "font-mono text-sm text-kumo-subtle"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "className") && $setup.semanticEqual($setup.semanticValues.className, "custom") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "code") && $setup.semanticEqual($setup.semanticValues.code, "echo kumo") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "lang") && $setup.semanticEqual($setup.semanticValues.lang, "bash"))
        ? (_openBlock(), _createElementBlock("pre", _hoisted_1, _toDisplayString($setup.semanticValues.code), 1 /* TEXT */))
        : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "code") && $setup.semanticEqual($setup.semanticValues.code, "const x = 1;"))
            ? (_openBlock(), _createElementBlock("pre", _hoisted_2, _toDisplayString($setup.semanticValues.code), 1 /* TEXT */))
            : (_openBlock(), _createElementBlock("code", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, _toDisplayString($setup.props.code), 3 /* TEXT, CLASS */));
}
__sfc__.render = render;
__sfc__.name = "code";
__sfc__.__file = "components/code.vue";
export default __sfc__;

export { __sfc__ as Code }
