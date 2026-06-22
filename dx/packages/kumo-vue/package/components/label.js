import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "5095f41d10b4171b26a76054676cdd46240c352d0283a678dedfe13047e9ca2f";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'label',
    props: {
        asContent: { type: Boolean, required: false, default: false },
        children: { type: null, required: false },
        className: { type: String, required: false },
        htmlFor: { type: String, required: false },
        showOptional: { type: Boolean, required: false, default: false },
        tooltip: { type: null, required: false },
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
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { key: 1 };
const _hoisted_3 = { key: 2 };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "Middle Name") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "showOptional") && $setup.semanticEqual($setup.semanticValues.showOptional, true))
        ? (_openBlock(), _createElementBlock("label", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("span", { class: "font-normal text-kumo-subtle" }, null, -1 /* CACHED */),
                _createTextVNode(_toDisplayString("Middle Name(optional)"), -1 /* CACHED */)
            ]))]))
        : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "asContent") && $setup.semanticEqual($setup.semanticValues.asContent, true) && $setup.semanticEqual($setup.renderContent(), "Email"))
            ? (_openBlock(), _createElementBlock("span", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : ($setup.semanticEqual($setup.renderContent(), "Email"))
                ? (_openBlock(), _createElementBlock("label", _hoisted_3, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
                : (_openBlock(), _createElementBlock("label", {
                    key: 3,
                    class: _normalizeClass([$setup.styles["root"]])
                }, [
                    _renderSlot(_ctx.$slots, "default")
                ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoLabel";
__sfc__.__file = "components/label.vue";
export default __sfc__;

export { __sfc__ as Label }
