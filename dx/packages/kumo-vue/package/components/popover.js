import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "34d7ee992f8f6e187cd36b1471f571733ec206033242ce3ffd4aab7a353a5f8b";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'popover',
    props: {
        Close: { type: null, required: false },
        Content: { type: null, required: false },
        Root: { type: null, required: false },
        "Title/Description": { type: null, required: false },
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
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, createElementVNode as _createElementVNode, normalizeClass as _normalizeClass, Teleport as _Teleport, createBlock as _createBlock } from "vue";
const _hoisted_1 = {
    key: 0,
    type: "button",
    tabindex: "0",
    "aria-haspopup": "dialog",
    "aria-expanded": "false",
    "data-kumo-component": "Popover",
    "data-kumo-part": "trigger"
};
const _hoisted_2 = { "data-kumo-layer": "popover" };
const _hoisted_3 = { "data-kumo-part": "popover" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [{ "export": ".Trigger", "props": {}, "children": [{ "text": "Open" }] }] }))
        ? (_openBlock(), _createElementBlock("button", _hoisted_1, _toDisplayString($setup.fixtureText($setup.fixture)), 1 /* TEXT */))
        : (_openBlock(), _createBlock(_Teleport, {
            key: 1,
            to: "document-body"
        }, [
            _createElementVNode("div", _hoisted_2, [
                _createElementVNode("div", {
                    "data-kumo-compound": "popover",
                    class: _normalizeClass($setup.styles.root)
                }, [
                    _createElementVNode("section", _hoisted_3, [
                        _renderSlot(_ctx.$slots, "popover")
                    ])
                ], 2 /* CLASS */)
            ])
        ]));
}
__sfc__.render = render;
__sfc__.name = "KumoPopover";
__sfc__.__file = "components/popover.vue";
export default __sfc__;

export { __sfc__ as Popover }
