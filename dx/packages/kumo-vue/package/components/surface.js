import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "bcb4aa3e592b9584d7e18fe498c9d2cfaad66ee570e649a81bfcf73eeccac950";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'surface',
    props: {
        as: { type: null, required: false },
        children: { type: null, required: false },
        className: { type: String, required: false },
        color: { type: String, required: false, default: "primary" },
        render: { type: null, required: false },
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
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    "data-surface-color": "secondary",
    "data-deprecated": "surface"
};
const _hoisted_2 = {
    key: 1,
    "data-surface-color": "primary",
    "data-deprecated": "surface"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "as") && $setup.semanticEqual($setup.semanticValues.as, "section") && $setup.semanticEqual($setup.renderContent(), "Card") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "color") && $setup.semanticEqual($setup.semanticValues.color, "secondary"))
        ? (_openBlock(), _createElementBlock("section", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.renderContent(), "Card"))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "surface";
__sfc__.__file = "components/surface.vue";
export default __sfc__;

export { __sfc__ as Surface }
