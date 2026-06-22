import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "09c586d6894b365150e81a5fba8032a98695d8f6cd14bf4ea0f0466bda52b194";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'empty',
    props: {
        className: { type: String, required: false },
        commandLine: { type: String, required: false },
        contents: { type: null, required: false },
        description: { type: String, required: false },
        icon: { type: null, required: false },
        size: { type: String, required: false, default: "base" },
        title: { type: String, required: true },
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
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, createTextVNode as _createTextVNode, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "px-10 py-16 gap-6"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "title") && $setup.semanticEqual($setup.semanticValues.title, "No results"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [
            _createElementVNode("h2", null, _toDisplayString($setup.semanticValues.title), 1 /* TEXT */)
        ]))
        : (_openBlock(), _createElementBlock("section", {
            key: 1,
            class: _normalizeClass([$setup.styles["root"]])
        }, [
            _renderSlot(_ctx.$slots, "icon"),
            _createTextVNode(_toDisplayString($setup.props.title), 1 /* TEXT */),
            _renderSlot(_ctx.$slots, "description"),
            _renderSlot(_ctx.$slots, "contents")
        ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoEmpty";
__sfc__.__file = "components/empty.vue";
export default __sfc__;

export { __sfc__ as Empty }
