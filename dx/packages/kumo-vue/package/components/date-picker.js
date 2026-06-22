import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "5f335d94261bdac9b04be13a3684f1d47504a43360cb208c4a84231a1d259fce";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'date-picker',
    props: {
        "aria-label": { type: String, required: false },
        fromDate: { type: null, required: false },
        mode: { type: null, required: false },
        onChange: { type: null, required: false },
        reactDayPickerProps: { type: null, required: false },
        selected: { type: null, required: false },
        toDate: { type: null, required: false },
        defaultMonthDate: { type: null, required: false },
        selectedDate: { type: null, required: false },
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
    "aria-label": "Choose date"
};
const _hoisted_2 = { "data-kumo-layer": "date-picker" };
const _hoisted_3 = { "data-kumo-part": "date-picker" };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "ariaLabel") && $setup.semanticEqual($setup.semanticValues.ariaLabel, "Choose date") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "defaultMonthDate") && $setup.semanticEqual($setup.semanticValues.defaultMonthDate, "2025-01-01") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "mode") && $setup.semanticEqual($setup.semanticValues.mode, "single") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "selectedDate") && $setup.semanticEqual($setup.semanticValues.selectedDate, "2025-01-15"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("table", { role: "grid" }, null, -1 /* CACHED */),
                _createStaticVNode("<button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button><button></button>", 37)
            ]))]))
        : (_openBlock(), _createBlock(_Teleport, {
            key: 1,
            to: "document-body"
        }, [
            _createElementVNode("div", _hoisted_2, [
                _createElementVNode("div", {
                    "data-kumo-compound": "date-picker",
                    class: _normalizeClass($setup.styles.root)
                }, [
                    _createElementVNode("section", _hoisted_3, [
                        _renderSlot(_ctx.$slots, "date-picker")
                    ])
                ], 2 /* CLASS */)
            ])
        ]));
}
__sfc__.render = render;
__sfc__.name = "KumoDatePicker";
__sfc__.__file = "components/date-picker.vue";
export default __sfc__;

export { __sfc__ as DatePicker }
