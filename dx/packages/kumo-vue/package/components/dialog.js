import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "f9517f6c346751f7fb38e9984e7e08637053542c11e623d7b71778e55bf138cb";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'dialog',
    props: {
        Close: { type: null, required: false },
        Description: { type: null, required: false },
        Dialog: { type: null, required: false },
        Root: { type: String, required: false },
        Title: { type: null, required: false },
        Trigger: { type: null, required: false },
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
import { renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, openBlock as _openBlock, createBlock as _createBlock, createElementBlock as _createElementBlock } from "vue";
const _hoisted_1 = { "data-kumo-layer": "dialog" };
const _hoisted_2 = { "data-kumo-part": "dialog" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (_openBlock(), _createElementBlock("template", null, [
        (_openBlock(), _createBlock(_Teleport, { to: "document-body" }, [
            _createElementVNode("div", _hoisted_1, [
                _createElementVNode("div", {
                    "data-kumo-compound": "dialog",
                    class: _normalizeClass($setup.styles.root)
                }, [
                    _createElementVNode("section", _hoisted_2, [
                        _renderSlot(_ctx.$slots, "dialog")
                    ])
                ], 2 /* CLASS */)
            ])
        ]))
    ]));
}
__sfc__.render = render;
__sfc__.name = "dialog";
__sfc__.__file = "components/dialog.vue";
export default __sfc__;

export { __sfc__ as Dialog }
