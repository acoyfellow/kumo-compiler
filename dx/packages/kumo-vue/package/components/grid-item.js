import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "40f49eae26c10cb50f9eff28ca613e0eb9e5cf415f57f0b763ec8e8cc46f2a16";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'grid-item',
    props: {
        children: { type: null, required: false },
        className: { type: String, required: false },
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
import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock, renderSlot as _renderSlot, normalizeClass as _normalizeClass } from "vue";
const _hoisted_1 = {
    key: 0,
    class: "p-4"
};
const _hoisted_2 = { key: 1 };
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return ($setup.semanticEqual($setup.renderContent(), "Cell") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "className") && $setup.semanticEqual($setup.semanticValues.className, "p-4"))
        ? (_openBlock(), _createElementBlock("div", _hoisted_1, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
        : ($setup.semanticEqual($setup.renderContent(), "Cell"))
            ? (_openBlock(), _createElementBlock("div", _hoisted_2, _toDisplayString($setup.renderContent()), 1 /* TEXT */))
            : (_openBlock(), _createElementBlock("div", {
                key: 2,
                class: _normalizeClass([$setup.styles["root"]])
            }, [
                _renderSlot(_ctx.$slots, "default")
            ], 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoGridItem";
__sfc__.__file = "components/grid-item.vue";
export default __sfc__;

export { __sfc__ as GridItem }
