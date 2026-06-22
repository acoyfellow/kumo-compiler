import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "fb89a6c7da3d24b06ce460e02d60941a1dc33621cc70df51098d707e9255e776";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'button',
    props: {
        disabled: { type: Boolean, required: false },
        icon: { type: null, required: false },
        loading: { type: Boolean, required: false, default: false },
        native: { type: null, required: false },
        shape: { type: String, required: false, default: "base" },
        size: { type: String, required: false, default: "base" },
        variant: { type: String, required: false, default: "secondary" },
        "data-probe": { type: null, required: false },
        name: { type: null, required: false },
        value: { type: null, required: false },
        "aria-label": { type: null, required: false },
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
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    type: "button",
    name: "intent",
    value: "save",
    "data-probe": "native",
    "data-kumo-component": "Button"
};
const _hoisted_2 = {
    key: 1,
    class: "bg-kumo-brand h-5 text-xs"
};
const _hoisted_3 = {
    key: 2,
    class: "bg-kumo-danger h-10 text-base"
};
const _hoisted_4 = {
    key: 3,
    "aria-label": "Add item",
    class: "rounded-full size-6.5"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "Save") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "dataProbe") && $setup.semanticEqual($setup.semanticValues.dataProbe, "native") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "name") && $setup.semanticEqual($setup.semanticValues.name, "intent") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "value") && $setup.semanticEqual($setup.semanticValues.value, "save"))
        ? (_openBlock(), _createElementBlock("button", _hoisted_1, [
            _createElementVNode("span", null, _toDisplayString($setup.renderContent()), 1 /* TEXT */)
        ]))
        : ($setup.semanticEqual($setup.renderContent(), "Create") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "xs") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "primary"))
            ? (_openBlock(), _createElementBlock("button", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : ($setup.semanticEqual($setup.renderContent(), "Delete") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "lg") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "destructive"))
                ? (_openBlock(), _createElementBlock("button", _hoisted_3, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
                : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Add item") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "shape") && $setup.semanticEqual($setup.semanticValues.shape, "circle") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "sm"))
                    ? (_openBlock(), _createElementBlock("button", _hoisted_4))
                    : (_openBlock(), _createElementBlock("button", {
                        key: 4,
                        class: _normalizeClass([$setup.styles["root"]])
                    }, null, 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoButton";
__sfc__.__file = "components/button.vue";
export default __sfc__;

export { __sfc__ as Button }
