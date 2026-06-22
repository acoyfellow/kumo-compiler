import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "66e89c0778455462b2e0f570cd8e93d03c70b2080ad1568935860a9da97e5065";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'link',
    props: {
        children: { type: null, required: false },
        className: { type: String, required: false },
        href: { type: String, required: false },
        render: { type: null, required: false },
        variant: { type: null, required: false, default: "inline" },
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
    href: "https://example.com",
    class: "hover:text-kumo-link/70"
};
const _hoisted_2 = {
    key: 1,
    href: "/docs",
    "data-kumo-component": "Link",
    class: "text-kumo-link underline"
};
const _hoisted_3 = ["href"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "External") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "href") && $setup.semanticEqual($setup.semanticValues.href, "https://example.com") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "plain"))
        ? (_openBlock(), _createElementBlock("a", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.renderContent(), "Docs") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "href") && $setup.semanticEqual($setup.semanticValues.href, "/docs"))
            ? (_openBlock(), _createElementBlock("a", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : (_openBlock(), _createElementBlock("a", {
                key: 2,
                href: $setup.props.href,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 10 /* CLASS, PROPS */, _hoisted_3));
}
__sfc__.render = render;
__sfc__.name = "KumoLink";
__sfc__.__file = "components/link.vue";
export default __sfc__;

export { __sfc__ as Link }
