import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "81f51f73fcb15fac9412c9a30a06ea03f1e2fa2292ec5b6197d72c106554a466";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'table-of-contents',
    props: {
        Group: { type: null, required: false },
        Item: { type: Boolean, required: false },
        List: { type: null, required: false },
        root: { type: null, required: false },
        Title: { type: null, required: false },
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
const _hoisted_1 = {
    key: 0,
    "aria-label": "Article sections"
};
const _hoisted_2 = {
    key: 1,
    "aria-label": "Table of contents"
};
const _hoisted_3 = { "data-kumo-part": "root" };
const _hoisted_4 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.fixture, { "export": "root", "props": { "aria-label": "Article sections" }, "children": [{ "export": ".Title", "props": {}, "children": [{ "text": "On this page" }] }, { "export": ".List", "props": {}, "children": [{ "export": ".Item", "props": { "href": "#intro", "active": true }, "children": [{ "text": "Introduction" }] }, { "export": ".Item", "props": { "href": "#install" }, "children": [{ "text": "Installation" }] }] }] }))
        ? (_openBlock(), _createElementBlock("nav", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("p", null, _toDisplayString("On this page"), -1 /* CACHED */),
                _createElementVNode("ul", null, null, -1 /* CACHED */),
                _createElementVNode("a", null, null, -1 /* CACHED */),
                _createElementVNode("a", null, null, -1 /* CACHED */)
            ]))]))
        : ($setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [{ "export": ".List", "props": {}, "children": [{ "export": ".Group", "props": { "label": "Getting started", "href": "#getting-started", "active": true }, "children": [{ "export": ".Item", "props": { "href": "#install" }, "children": [{ "text": "Install" }] }, { "export": ".Item", "props": { "href": "#setup" }, "children": [{ "text": "Setup" }] }] }] }] }))
            ? (_openBlock(), _createElementBlock("nav", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("ul", null, null, -1 /* CACHED */),
                    _createElementVNode("li", null, null, -1 /* CACHED */),
                    _createElementVNode("li", null, null, -1 /* CACHED */),
                    _createElementVNode("a", null, null, -1 /* CACHED */),
                    _createElementVNode("a", null, null, -1 /* CACHED */),
                    _createElementVNode("a", null, null, -1 /* CACHED */)
                ]))]))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                "data-kumo-compound": "table-of-contents",
                class: _normalizeClass($setup.styles.root)
            }, [
                _createElementVNode("section", _hoisted_3, [
                    _renderSlot(_ctx.$slots, "root")
                ]),
                _createElementVNode("section", _hoisted_4, [
                    _renderSlot(_ctx.$slots, "collection")
                ])
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "table-of-contents";
__sfc__.__file = "components/table-of-contents.vue";
export default __sfc__;

export { __sfc__ as TableOfContents }
