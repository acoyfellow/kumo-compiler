import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "e57b4fc419d2b1310d0ea4963a5181380a89060415280931c0e7698f1cd2ede2";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'banner',
    props: {
        action: { type: null, required: false },
        children: { type: null, required: false },
        className: { type: String, required: false },
        description: { type: null, required: false },
        icon: { type: null, required: false },
        text: { type: String, required: false },
        title: { type: String, required: false },
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
import { createElementVNode as _createElementVNode, toDisplayString as _toDisplayString, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "bg-kumo-banner-info"
};
const _hoisted_2 = {
    key: 1,
    class: "bg-kumo-banner-warning text-kumo-warning"
};
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "description") && $setup.semanticEqual($setup.semanticValues.description, "Details") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "title") && $setup.semanticEqual($setup.semanticValues.title, "Notice"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, [...(_cache[0] || (_cache[0] = [
                _createElementVNode("p", null, null, -1 /* CACHED */),
                _createElementVNode("p", null, null, -1 /* CACHED */),
                _createTextVNode(_toDisplayString("NoticeDetails"), -1 /* CACHED */)
            ]))]))
        : ($setup.semanticEqual($setup.renderContent(), "Careful") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "alert"))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, [
                _createElementVNode("p", null, _toDisplayString($setup.renderContent()), 1 /* TEXT */)
            ]))
            : (_openBlock(), _createElementBlock("section", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "icon"),
                _createTextVNode(_toDisplayString($setup.props.title), 1 /* TEXT */),
                _renderSlot(_ctx.$slots, "description"),
                _renderSlot(_ctx.$slots, "action"),
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoBanner";
__sfc__.__file = "components/banner.vue";
export default __sfc__;

export { __sfc__ as Banner }
