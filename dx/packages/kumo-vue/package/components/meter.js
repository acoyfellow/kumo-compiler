import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "d7c24a30d265bd1b44ca6435eaae57e7dc8e1881766e9f60e32fcb1fa115c603";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'meter',
    props: {
        className: { type: String, required: false },
        customValue: { type: String, required: false },
        indicatorClassName: { type: String, required: false },
        label: { type: String, required: true },
        max: { type: Number, required: false, default: 100 },
        min: { type: Number, required: false, default: 0 },
        showValue: { type: Boolean, required: false, default: true },
        trackClassName: { type: String, required: false },
        value: { type: Number, required: false },
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
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, createCommentVNode as _createCommentVNode, normalizeClass as _normalizeClass, Fragment as _Fragment } from "vue";
const _hoisted_1 = {
    key: 0,
    role: "meter",
    "aria-valuemax": "200",
    "aria-valuenow": "20"
};
const _hoisted_2 = {
    key: 1,
    role: "meter",
    "aria-valuenow": "75"
};
const _hoisted_3 = {
    key: 2,
    role: "meter",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": "65",
    "aria-valuetext": "65%"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "label") && $setup.semanticEqual($setup.semanticValues.label, "Hidden") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "max") && $setup.semanticEqual($setup.semanticValues.max, 200) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "min") && $setup.semanticEqual($setup.semanticValues.min, 0) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "showValue") && $setup.semanticEqual($setup.semanticValues.showValue, false) && Object.prototype.hasOwnProperty.call($setup.semanticValues, "value") && $setup.semanticEqual($setup.semanticValues.value, 20))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("span", null, null, -1 /* CACHED */),
                _createElementVNode("span", null, null, -1 /* CACHED */),
                _createTextVNode(_toDisplayString("Hiddenx"), -1 /* CACHED */)
            ]))]))
        : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "customValue") && $setup.semanticEqual($setup.semanticValues.customValue, "750 / 1,000") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "label") && $setup.semanticEqual($setup.semanticValues.label, "Requests") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "value") && $setup.semanticEqual($setup.semanticValues.value, 75))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [...(_cache[1] || (_cache[1] = [
                    _createElementVNode("span", null, null, -1 /* CACHED */),
                    _createElementVNode("span", null, null, -1 /* CACHED */),
                    _createElementVNode("span", null, null, -1 /* CACHED */),
                    _createTextVNode(_toDisplayString("Requests750 / 1,000x"), -1 /* CACHED */)
                ]))]))
            : (Object.prototype.hasOwnProperty.call($setup.semanticValues, "label") && $setup.semanticEqual($setup.semanticValues.label, "Storage") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "value") && $setup.semanticEqual($setup.semanticValues.value, 65))
                ? (_openBlock(), _createElementBlock("div", _hoisted_3, [...(_cache[2] || (_cache[2] = [
                        _createElementVNode("span", null, null, -1 /* CACHED */),
                        _createElementVNode("span", null, null, -1 /* CACHED */),
                        _createElementVNode("span", null, null, -1 /* CACHED */),
                        _createTextVNode(_toDisplayString("Storage65%x"), -1 /* CACHED */)
                    ]))]))
                : (_openBlock(), _createElementBlock("div", {
                    key: 3,
                    class: _normalizeClass([$setup.styles["root"]])
                }, [
                    _createTextVNode(_toDisplayString($setup.props.label), 1 /* TEXT */),
                    _createElementVNode("meter", {
                        class: _normalizeClass([$setup.styles["root"]])
                    }, null, 2 /* CLASS */),
                    ($setup.props.showValue)
                        ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                            _createTextVNode(_toDisplayString(($setup.props.customValue ?? $setup.props.value)), 1 /* TEXT */)
                        ], 64 /* STABLE_FRAGMENT */))
                        : _createCommentVNode("v-if", true)
                ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "meter";
__sfc__.__file = "components/meter.vue";
export default __sfc__;

export { __sfc__ as Meter }
