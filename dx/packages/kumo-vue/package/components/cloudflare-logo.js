import { defineComponent as _defineComponent } from "vue";
const modelDigest = "50b2371be89b11ae83917c42fdb9b67c42df8467c98e2668e0540afd07dc8c58";
const __sfc__ = /* @__PURE__ */ _defineComponent({
  __name: "cloudflare-logo",
  props: {
    className: { type: String, required: false },
    color: { type: null, required: false, default: "color" },
    variant: { type: null, required: false, default: "full" }
  },
  emits: [],
  setup(__props, { expose: __expose, emit: __emit }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const styles = { "root": "kumo-cloudflare-logo-root" };
    const __returned__ = { modelDigest, props, emit, styles };
    Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
    return __returned__;
  }
});
import { normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue";
function render(_ctx, _cache, $props, $setup, $data, $options) {
  return _openBlock(), _createElementBlock(
    "svg",
    {
      role: "img",
      "aria-label": "Cloudflare",
      class: _normalizeClass([$setup.styles["root"]])
    },
    null,
    2
    /* CLASS */
  );
}
__sfc__.render = render;
var cloudflare_logo_default = __sfc__;
export {
  cloudflare_logo_default as default,
  modelDigest
};
