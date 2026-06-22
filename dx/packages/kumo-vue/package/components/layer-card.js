import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "4776632c394a536ecd5477ef13e2a89249e69a1b3208a445b782496b317647f1";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'layer-card',
    props: {
        children: { type: null, required: false },
        className: { type: String, required: false },
        render: { type: null, required: false },
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
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "bg-kumo-base shadow-xs ring-kumo-line"
};
const _hoisted_2 = {
    key: 1,
    class: "bg-kumo-elevated ring-kumo-hairline"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "Card"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [{ "export": ".Secondary", "props": {}, "children": [{ "text": "Top" }] }, { "export": ".Primary", "props": {}, "children": [{ "text": "Main" }] }] }))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
                _cache[0] || (_cache[0] = _createElementVNode("div", null, null, -1 /* CACHED */)),
                _cache[1] || (_cache[1] = _createElementVNode("div", null, null, -1 /* CACHED */)),
                _createTextVNode(_toDisplayString($setup.fixtureText($setup.fixture)), 1 /* TEXT */)
            ]))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoLayerCard";
__sfc__.__file = "components/layer-card.vue";
export default __sfc__;

export { __sfc__ as LayerCard }
