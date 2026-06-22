import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "3cfb56490eb493fd3a522a1fdf7ba0b041d91576a3c454046059939ae2aae977";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'date-range-picker',
    props: {
        className: { type: String, required: false },
        onEndDateChange: { type: null, required: false },
        onStartDateChange: { type: null, required: false },
        size: { type: String, required: false, default: "base" },
        timezone: { type: String, required: false, default: "New York, NY, USA (GMT-4)" },
        variant: { type: null, required: false, default: "default" },
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
import { createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass, Teleport as _Teleport, createBlock as _createBlock, createStaticVNode as _createStaticVNode } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "p-3 bg-kumo-base"
};
const _hoisted_2 = {
    key: 1,
    class: "p-4 bg-kumo-overlay"
};
const _hoisted_3 = { "data-kumo-layer": "date-range-picker" };
const _hoisted_4 = { "data-kumo-part": "date-range-picker" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "size") && $setup.semanticEqual($setup.semanticValues.size, "sm") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "timezone") && $setup.semanticEqual($setup.semanticValues.timezone, "UTC") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "subtle"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createStaticVNode("<button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button>", 87)
            ]))]))
        : true
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createStaticVNode("<button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button>", 87)
                ]))]))
            : (_openBlock(), _createBlock(_Teleport, {
                key: 2,
                to: "document-body"
            }, [
                _createElementVNode("div", _hoisted_3, [
                    _createElementVNode("div", {
                        "data-kumo-compound": "date-range-picker",
                        class: _normalizeClass($setup.styles.root)
                    }, [
                        _createElementVNode("section", _hoisted_4, [
                            _renderSlot(_ctx.$slots, "date-range-picker")
                        ])
                    ], 2 /* CLASS */)
                ])
            ]));
}
__sfc__.render = render;
__sfc__.name = "date-range-picker";
__sfc__.__file = "components/date-range-picker.vue";
export default __sfc__;

export { __sfc__ as DateRangePicker }
