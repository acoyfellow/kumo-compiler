import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "851f6bb506c384c8d6d8ec9583d3ec05a0cf060d5d9192464a29ba55e1185844";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'radio',
    props: {
        defaultValue: { type: String, required: false },
        disabled: { type: Boolean, required: false },
        items: { type: null, required: false },
        onValueChange: { type: null, required: false },
        orientation: { type: null, required: false, default: "vertical" },
        value: { type: String, required: false },
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
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = { "data-kumo-part": "root" };
const _hoisted_2 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (_openBlock(), _createElementBlock("template", null, [
        _createElementVNode("div", {
            "data-kumo-compound": "radio",
            class: _normalizeClass($setup.styles.root)
        }, [
            _createElementVNode("section", _hoisted_1, [
                _renderSlot(_ctx.$slots, "root")
            ]),
            _createElementVNode("section", _hoisted_2, [
                _renderSlot(_ctx.$slots, "collection")
            ])
        ], 2 /* CLASS */)
    ]));
}
__sfc__.render = render;
__sfc__.name = "radio";
__sfc__.__file = "components/radio.vue";
export default __sfc__;

export { __sfc__ as Radio }
