import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "25a19cbe99e84a9f4daf06d56a4f43a039827812a3623bc39919eb4683550b77";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'sidebar',
    props: {
        Collapsible: { type: null, required: false },
        CollapsibleTrigger: { type: null, required: false },
        MenuButton: { type: null, required: false },
        MenuSubButton: { type: null, required: false },
        Provider: { type: null, required: false },
        root: { type: null, required: false },
        SlidingView: { type: null, required: false },
        SlidingViews: { type: null, required: false },
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
import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    "data-state": "collapsed"
};
const _hoisted_2 = { key: 1 };
const _hoisted_3 = { "data-kumo-part": "root" };
const _hoisted_4 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.fixture, { "export": ".Provider", "props": { "defaultOpen": false }, "children": [{ "export": "root", "props": {}, "children": [{ "export": ".SlidingViews", "props": { "activeKey": "account" }, "children": [{ "export": ".SlidingView", "props": { "value": "account" }, "children": [{ "text": "Account nav" }] }, { "export": ".SlidingView", "props": { "value": "zone" }, "children": [{ "text": "Zone nav" }] }] }, { "export": ".Trigger", "props": {}, "children": [] }] }] }))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("aside", { "data-state": "collapsed" }, null, -1 /* CACHED */)
            ]))]))
        : ($setup.semanticEqual($setup.fixture, { "export": ".Provider", "props": {}, "children": [{ "export": "root", "props": {}, "children": [{ "export": ".Collapsible", "props": {}, "children": [{ "export": ".CollapsibleContent", "props": {}, "children": [{ "text": "Nested navigation" }] }] }] }] }))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                "data-kumo-compound": "sidebar",
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
__sfc__.name = "KumoSidebar";
__sfc__.__file = "components/sidebar.vue";
export default __sfc__;

export { __sfc__ as Sidebar }
