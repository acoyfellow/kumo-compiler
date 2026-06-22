import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "77368ecd52b54b2d85a270ad010c77b8e23e8c0be9b82414610908b3a84f636d";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'grid',
    props: {
        children: { type: null, required: false },
        className: { type: String, required: false },
        gap: { type: String, required: false, default: "base" },
        mobileDivider: { type: Boolean, required: false },
        variant: { type: null, required: false },
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
    class: "grid-cols-2 gap-0"
};
const _hoisted_2 = {
    key: 1,
    class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "Two") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "gap") && $setup.semanticEqual($setup.semanticValues.gap, "none") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "side-by-side"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.renderContent(), "Cells") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "3up"))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "grid";
__sfc__.__file = "components/grid.vue";
export default __sfc__;

export { __sfc__ as Grid }
