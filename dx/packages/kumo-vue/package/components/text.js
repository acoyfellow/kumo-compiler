import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "19772bcfdc866198d1b6f48413057aaede6eb359bfb324e0ee9f1aa353f1b630";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'text',
    props: {
        as: { type: null, required: false },
        bold: { type: Boolean, required: false, default: false },
        children: { type: null, required: false },
        DANGEROUS_className: { type: String, required: false },
        DANGEROUS_style: { type: null, required: false },
        size: { type: String, required: false, default: "base" },
        truncate: { type: Boolean, required: false, default: false },
        variant: { type: null, required: false, default: "body" },
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
    class: "text-3xl font-semibold"
};
const _hoisted_2 = {
    key: 1,
    class: "font-mono text-sm"
};
const _hoisted_3 = {
    key: 2,
    class: "text-kumo-default text-base"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "as") && $setup.semanticEqual($setup.semanticValues.as, "h1") && $setup.semanticEqual($setup.renderContent(), "Title") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "heading1"))
        ? (_openBlock(), _createElementBlock("h1", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.renderContent(), "code") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "mono"))
            ? (_openBlock(), _createElementBlock("span", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : ($setup.semanticEqual($setup.renderContent(), "Body"))
                ? (_openBlock(), _createElementBlock("p", _hoisted_3, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
                : (_openBlock(), _createElementBlock("span", {
                    key: 3,
                    class: _normalizeClass([$setup.styles["root"]])
                }, [
                    _renderSlot(_ctx.$slots, "default")
                ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoText";
__sfc__.__file = "components/text.vue";
export default __sfc__;

export { __sfc__ as Text }
