import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "188bad4486283b6daed15b228465d53415f5e138ecb140a8de65b390602a0a22";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'menu-bar',
    props: {
        className: { type: String, required: false },
        isActive: { type: null, required: false },
        optionIds: { type: Boolean, required: false, default: false },
        options: { type: null, required: false },
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
import { openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "isolate flex rounded-lg ring-kumo-line bg-kumo-recessed"
};
const _hoisted_2 = { "data-kumo-part": "root" };
const _hoisted_3 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "isActive") && $setup.semanticEqual($setup.semanticValues.isActive, 0) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "options") && $setup.semanticEqual($setup.semanticValues.options, []))
        ? (_openBlock(), _createElementBlock("nav", _hoisted_1))
        : (_openBlock(), _createElementBlock("div", {
            key: 1,
            "data-kumo-compound": "menu-bar",
            class: _normalizeClass($setup.styles.root)
        }, [
            _createElementVNode("section", _hoisted_2, [
                _renderSlot(_ctx.$slots, "root")
            ]),
            _createElementVNode("section", _hoisted_3, [
                _renderSlot(_ctx.$slots, "collection")
            ])
        ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "menu-bar";
__sfc__.__file = "components/menu-bar.vue";
export default __sfc__;

export { __sfc__ as MenuBar }
