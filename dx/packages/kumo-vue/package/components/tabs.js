import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "79ef8064a09f0913da0ed4e2cceaee0c9227ca5a0bfd2311b29c281595691791";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'tabs',
    props: {
        activateOnFocus: { type: Boolean, required: false, default: false },
        className: { type: null, required: false },
        indicatorClassName: { type: null, required: false },
        listClassName: { type: null, required: false },
        onValueChange: { type: String, required: false },
        selectedValue: { type: String, required: false, default: "first tab value when uncontrolled and selectedValue omitted" },
        size: { type: String, required: false, default: "base" },
        tabs: { type: null, required: false, default: [] },
        value: { type: String, required: false },
        variant: { type: null, required: false, default: "segmented" },
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
import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { key: 1 };
const _hoisted_3 = { "data-kumo-part": "root" };
const _hoisted_4 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "selectedValue") && $setup.semanticEqual($setup.semanticValues.selectedValue, "settings") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "sm") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "tabs") && $setup.semanticEqual($setup.semanticValues.tabs, [{ "value": "overview", "label": "Overview" }, { "value": "settings", "label": "Settings" }]) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "underline") && $setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [] }))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("button", null, null, -1 /* CACHED */),
                _createElementVNode("button", null, null, -1 /* CACHED */)
            ]))]))
        : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "tabs") && $setup.semanticEqual($setup.semanticValues.tabs, [{ "value": "overview", "label": "Overview" }, { "value": "settings", "label": "Settings" }]) && $setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [] }))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */)
                ]))]))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                "data-kumo-compound": "tabs",
                class: _normalizeClass($setup.styles.root)
            }, [
                _createElementVNode("section", _hoisted_3, [
                    _renderSlot(_ctx.$slots, "root")
                ]),
                _createElementVNode("section", _hoisted_4, [
                    _renderSlot(_ctx.$slots, "collection")
                ])
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoTabs";
__sfc__.__file = "components/tabs.vue";
export default __sfc__;

export { __sfc__ as Tabs }
