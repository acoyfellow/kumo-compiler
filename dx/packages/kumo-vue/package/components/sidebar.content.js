import { defineComponent as _defineComponent } from 'vue';
const __sfc__ = /*@__PURE__*/ _defineComponent({
    ...{ inheritAttrs: false },
    __name: 'sidebar.content',
    setup(__props, { expose: __expose }) {
        __expose();
        const __returned__ = {};
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});
import { renderSlot as _renderSlot, mergeProps as _mergeProps, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
    return (_openBlock(), _createElementBlock("span", _mergeProps(_ctx.$attrs, { "data-kumo-part": "Content" }), [
        _renderSlot(_ctx.$slots, "default")
    ], 16 /* FULL_PROPS */));
}
__sfc__.render = render;
__sfc__.name = "sidebar.content";
__sfc__.__file = "components/sidebar.content.vue";
export default __sfc__;
