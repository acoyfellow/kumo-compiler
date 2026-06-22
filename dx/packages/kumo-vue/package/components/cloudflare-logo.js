import { defineComponent as _defineComponent } from 'vue';
import { computed, useAttrs, useSlots } from 'vue';
export const modelDigest = "b2674fc7e38cace5a90134bb36e79807b0f150548237eb9c09d8398b0c1fa228";
export const contentBindingDigest = "a6655036dbbdb2cd56a9e62bf5f2f8f75bb6a7bb4d3c5fbf41726fd8666277cd";
const __sfc__ = /*@__PURE__*/ _defineComponent({
    __name: 'cloudflare-logo',
    props: {
        className: { type: String, required: false },
        color: { type: null, required: false, default: "color" },
        variant: { type: null, required: false, default: "full" },
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
import { createElementVNode as _createElementVNode, resolveDynamicComponent as _resolveDynamicComponent, mergeProps as _mergeProps, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock, normalizeClass as _normalizeClass, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (Object.prototype.hasOwnProperty.call($setup.semanticValues, "color") && $setup.semanticEqual($setup.semanticValues.color, "white") && Object.prototype.hasOwnProperty.call($setup.semanticValues, "variant") && $setup.semanticEqual($setup.semanticValues.variant, "glyph"))
        ? (_openBlock(), _createBlock(_resolveDynamicComponent('svg'), _mergeProps({ key: 0 }, { "role": "img", "aria-label": "Cloudflare logo", "viewBox": "0 0 49 22" }, { class: "text-white" }), {
            default: _withCtx(() => [...(_cache[0] || (_cache[0] = [
                    _createElementVNode("path", null, null, -1 /* CACHED */),
                    _createElementVNode("path", null, null, -1 /* CACHED */)
                ]))]),
            _: 1 /* STABLE */
        }, 16 /* FULL_PROPS */))
        : true
            ? (_openBlock(), _createBlock(_resolveDynamicComponent('svg'), _mergeProps({ key: 1 }, { "role": "img", "aria-label": "Cloudflare logo", "viewBox": "0 0 425.6 143.63" }, { class: "text-kumo-default" }), {
                default: _withCtx(() => [...(_cache[1] || (_cache[1] = [
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */),
                        _createElementVNode("path", null, null, -1 /* CACHED */)
                    ]))]),
                _: 1 /* STABLE */
            }, 16 /* FULL_PROPS */))
            : (_openBlock(), _createElementBlock("svg", {
                key: 2,
                role: "img",
                "aria-label": "Cloudflare",
                class: _normalizeClass([$setup.styles["root"]])
            }, null, 2 /* CLASS */));
}
__sfc__.render = render;
__sfc__.name = "KumoCloudflareLogo";
__sfc__.__file = "components/cloudflare-logo.vue";
export default __sfc__;

export { __sfc__ as CloudflareLogo }
