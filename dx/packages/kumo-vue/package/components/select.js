import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "0c3f889199eb1006a83fb3d1f7315e54f420dbb14327c8661decd4eb1b7a3215";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'select',
    props: {
        "aria-label/aria-labelledby": { type: null, required: false },
        children: { type: null, required: false },
        container: { type: null, required: false },
        hideLabel: { type: Boolean, required: false },
        items: { type: null, required: false },
        label: { type: null, required: false },
        "labelTooltip/description/error": { type: null, required: false },
        "placeholder/loading/disabled/required": { type: null, required: false },
        renderValue: { type: null, required: false },
        Root: { type: null, required: false },
        size: { type: String, required: false, default: "base" },
        "aria-label": { type: null, required: false },
        placeholder: { type: null, required: false },
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
const _hoisted_2 = { "data-kumo-part": "root" };
const _hoisted_3 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Fruit") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "placeholder") && $setup.semanticEqual($setup.semanticValues.placeholder, "Choose"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("button", {
                    type: "button",
                    tabindex: "0",
                    role: "combobox",
                    "aria-expanded": "false",
                    "aria-haspopup": "listbox",
                    "aria-label": "Fruit",
                    "data-kumo-component": "Select",
                    "data-kumo-part": "trigger"
                }, null, -1 /* CACHED */)
            ]))]))
        : (_openBlock(), _createElementBlock("div", {
            key: 1,
            "data-kumo-compound": "select",
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
__sfc__.name = "select";
__sfc__.__file = "components/select.vue";
export default __sfc__;

export { __sfc__ as Select }
