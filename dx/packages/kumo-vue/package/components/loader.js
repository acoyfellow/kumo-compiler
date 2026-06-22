import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "d7a0bf207268a5aec0eb6f604d50f666d06e022e0d21891ef527bc11a76785b3";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'loader',
    props: {
        "aria-label": { type: String, required: false, default: "Loading" },
        className: { type: String, required: false },
        size: { type: null, required: false, default: "base" },
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
import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    role: "status",
    "aria-label": "Working"
};
const _hoisted_2 = {
    key: 1,
    role: "status",
    "aria-label": "Loading",
    width: "24",
    height: "24"
};
const _hoisted_3 = ["aria-label"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Working") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "lg"))
        ? (_openBlock(), _createElementBlock("svg", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("circle", null, null, -1 /* CACHED */),
                _createElementVNode("circle", null, null, -1 /* CACHED */)
            ]))]))
        : true
            ? (_openBlock(), _createElementBlock("svg", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("circle", null, null, -1 /* CACHED */),
                    _createElementVNode("circle", null, null, -1 /* CACHED */)
                ]))]))
            : (_openBlock(), _createElementBlock("span", {
                key: 2,
                role: "status",
                "aria-label": $setup.props.aria_label,
                class: _normalizeClass([$setup.styles["root"]])
            }, null, 10 /* CLASS, PROPS */, _hoisted_3));
}
__sfc__.render = render;
__sfc__.name = "KumoLoader";
__sfc__.__file = "components/loader.vue";
export default __sfc__;

export { __sfc__ as Loader }
