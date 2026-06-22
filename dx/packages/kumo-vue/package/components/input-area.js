import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "3f2ca47762723bd72e47c5da8490058c226bbee67e5518d548fc19ba2c467f14";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'input-area',
    props: {
        observable: { type: null, required: false },
        "aria-label": { type: null, required: false },
        defaultValue: { type: null, required: false },
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
import { openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { key: 0 };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Notes") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "defaultValue") && $setup.semanticEqual($setup.semanticValues.defaultValue, "hello"))
        ? (_openBlock(), _createElementBlock("textarea", _hoisted_1))
        : (_openBlock(), _createElementBlock("textarea", {
            key: 1,
            class: _normalizeClass([$setup.styles["root"]])
        }, null, 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoInputArea";
__sfc__.__file = "components/input-area.vue";
export default __sfc__;

export { __sfc__ as InputArea }
