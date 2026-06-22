import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "70db6933357de8ee3d47759cd14f5ca8cab2cc88427a19740a54a5f4d65377b3";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'switch',
    props: {
        checked: { type: Boolean, required: false, default: false },
        disabled: { type: Boolean, required: false, default: false },
        group: { type: null, required: false },
        label: { type: null, required: false },
        onCheckedChange: { type: null, required: false },
        size: { type: String, required: false, default: "base" },
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
import { openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    role: "switch",
    "aria-checked": "false",
    class: "h-4 w-8"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Small") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "sm"))
        ? (_openBlock(), _createElementBlock("button", _hoisted_1))
        : (_openBlock(), _createElementBlock("button", {
            key: 1,
            class: _normalizeClass([$setup.styles["root"]])
        }, null, 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoSwitch";
__sfc__.__file = "components/switch.vue";
export default __sfc__;

export { __sfc__ as Switch }
