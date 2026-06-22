import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "4aabec222bec5b00f25388a2bb017b36c91349e55fa3ba6cb97fdc3d0afee0c0";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'command-palette',
    props: {
        compound: { type: null, required: false },
        Dialog: { type: null, required: false },
        Input: { type: null, required: false },
        Panel: { type: String, required: false },
        Root: { type: String, required: false },
        highlights: { type: null, required: false },
        text: { type: null, required: false },
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
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { "data-kumo-part": "root" };
const _hoisted_3 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "highlights") && $setup.semanticEqual($setup.semanticValues.highlights, [[0, 4]]) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "text") && $setup.semanticEqual($setup.semanticValues.text, "Cloudflare") && $setup.semanticEqual($setup.fixture, { "export": ".HighlightedText", "props": { "text": "Cloudflare", "highlights": [[0, 4]] }, "children": [] }))
        ? (_openBlock(), _createElementBlock("span", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("mark", null, _toDisplayString("Cloud"), -1 /* CACHED */)
            ]))]))
        : (_openBlock(), _createElementBlock("div", {
            key: 1,
            "data-kumo-compound": "command-palette",
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
__sfc__.name = "command-palette";
__sfc__.__file = "components/command-palette.vue";
export default __sfc__;

export { __sfc__ as CommandPalette }
