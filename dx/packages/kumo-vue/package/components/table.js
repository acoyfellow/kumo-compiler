import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "2cdb90ceb5108dea275b1e150e3868126326b95d7efef9ed8459d14ef57345b9";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'table',
    props: {
        children: { type: null, required: false },
        className: { type: String, required: false },
        layout: { type: null, required: false, default: "auto" },
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
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "table-fixed"
};
const _hoisted_2 = {
    key: 1,
    class: "isolate w-full"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "layout") && $setup.semanticEqual($setup.semanticValues.layout, "fixed") && $setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [{ "export": ".Body", "props": {}, "children": [{ "export": ".Row", "props": {}, "children": [{ "export": ".Cell", "props": { "sticky": "left" }, "children": [{ "text": "Pinned" }] }] }] }] }))
        ? (_openBlock(), _createElementBlock("table", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("tbody", null, null, -1 /* CACHED */),
                _createElementVNode("td", { class: "sticky left-0 z-1" }, _toDisplayString("Pinned"), -1 /* CACHED */)
            ]))]))
        : ($setup.semanticEqual($setup.fixture, { "export": "root", "props": {}, "children": [{ "export": ".Header", "props": {}, "children": [{ "export": ".Row", "props": {}, "children": [{ "export": ".Head", "props": {}, "children": [{ "text": "Name" }] }] }] }, { "export": ".Body", "props": {}, "children": [{ "export": ".Row", "props": {}, "children": [{ "export": ".Cell", "props": { "className": "bg-kumo-tint" }, "children": [{ "text": "Kumo" }] }] }] }] }))
            ? (_openBlock(), _createElementBlock("table", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("thead", null, null, -1 /* CACHED */),
                    _createElementVNode("tbody", null, null, -1 /* CACHED */),
                    _createElementVNode("tr", null, null, -1 /* CACHED */),
                    _createElementVNode("tr", null, null, -1 /* CACHED */),
                    _createElementVNode("th", null, _toDisplayString("Name"), -1 /* CACHED */),
                    _createElementVNode("td", { class: "bg-kumo-tint" }, _toDisplayString("Kumo"), -1 /* CACHED */)
                ]))]))
            : (_openBlock(), _createElementBlock("table", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "table";
__sfc__.__file = "components/table.vue";
export default __sfc__;

export { __sfc__ as Table }
