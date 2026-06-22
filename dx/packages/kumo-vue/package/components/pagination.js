import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "e429308d31e783f621359d7f7497bbae2ce32cc82be5a9a21f42a3664d712efb";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'pagination',
    props: {
        compound: { type: null, required: false },
        controls: { type: null, required: false, default: "full" },
        labels: { type: null, required: false, default: "English canonical labels" },
        page: { type: Number, required: false, default: 1 },
        pageSelector: { type: null, required: false, default: "input" },
        perPage: { type: Number, required: false },
        setPage: { type: null, required: false },
        totalCount: { type: Number, required: false },
        fixtureMode: { type: null, required: false },
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
const _hoisted_1 = { key: 0 };
const _hoisted_2 = { key: 1 };
const _hoisted_3 = {
    key: 2,
    "data-slot": "pagination"
};
const _hoisted_4 = { key: 3 };
const _hoisted_5 = { "data-kumo-part": "root" };
const _hoisted_6 = { "data-kumo-part": "collection" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "fixtureMode") && $setup.semanticEqual($setup.semanticValues.fixtureMode, "simple") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "labels") && $setup.semanticEqual($setup.semanticValues.labels, { "navigation": "Results pages", "previousPage": "Back", "nextPage": "Forward" }) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "page") && $setup.semanticEqual($setup.semanticValues.page, 2) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "perPage") && $setup.semanticEqual($setup.semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "totalCount") && $setup.semanticEqual($setup.semanticValues.totalCount, 35))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("nav", { "aria-label": "Results pages" }, null, -1 /* CACHED */),
                _createElementVNode("button", null, null, -1 /* CACHED */),
                _createElementVNode("button", null, null, -1 /* CACHED */)
            ]))]))
        : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "fixtureMode") && $setup.semanticEqual($setup.semanticValues.fixtureMode, "dropdown") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "page") && $setup.semanticEqual($setup.semanticValues.page, 2) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "perPage") && $setup.semanticEqual($setup.semanticValues.perPage, 25) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "totalCount") && $setup.semanticEqual($setup.semanticValues.totalCount, 100))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */),
                    _createElementVNode("button", null, null, -1 /* CACHED */)
                ]))]))
            : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "page") && $setup.semanticEqual($setup.semanticValues.page, 1) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "perPage") && $setup.semanticEqual($setup.semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "totalCount") && $setup.semanticEqual($setup.semanticValues.totalCount, 35))
                ? (_openBlock(), _createElementBlock("div", _hoisted_3, [...(_cache[2] || (_cache[2] = [
                        _createElementVNode("nav", { "aria-label": "Pagination" }, null, -1 /* CACHED */),
                        _createElementVNode("button", null, null, -1 /* CACHED */),
                        _createElementVNode("button", null, null, -1 /* CACHED */),
                        _createElementVNode("button", null, null, -1 /* CACHED */),
                        _createElementVNode("button", null, null, -1 /* CACHED */),
                        _createElementVNode("input", {
                            "aria-label": "Page number",
                            value: "1"
                        }, null, -1 /* CACHED */)
                    ]))]))
                : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "page") && $setup.semanticEqual($setup.semanticValues.page, 3) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "perPage") && $setup.semanticEqual($setup.semanticValues.perPage, 10) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "totalCount") && $setup.semanticEqual($setup.semanticValues.totalCount, 35))
                    ? (_openBlock(), _createElementBlock("div", _hoisted_4, [...(_cache[3] || (_cache[3] = [
                            _createElementVNode("input", { value: "1" }, null, -1 /* CACHED */)
                        ]))]))
                    : (_openBlock(), _createElementBlock("div", {
                        key: 4,
                        "data-kumo-compound": "pagination",
                        class: _normalizeClass($setup.styles.root)
                    }, [
                        _createElementVNode("section", _hoisted_5, [
                            _renderSlot(_ctx.$slots, "root")
                        ]),
                        _createElementVNode("section", _hoisted_6, [
                            _renderSlot(_ctx.$slots, "collection")
                        ])
                    ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoPagination";
__sfc__.__file = "components/pagination.vue";
export default __sfc__;

export { __sfc__ as Pagination }
