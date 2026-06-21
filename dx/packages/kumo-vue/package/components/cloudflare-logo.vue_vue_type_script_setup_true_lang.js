import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r } from "vue";
//#region generated/libraries/vue/components/cloudflare-logo.vue?vue&type=script&setup=true&lang.ts
var i = /*@__PURE__*/ t({
	__name: "cloudflare-logo",
	props: {
		className: {},
		color: { default: "color" },
		variant: { default: "full" }
	},
	emits: [],
	setup(t, { emit: i }) {
		let a = { root: "kumo-cloudflare-logo-root" };
		return (t, i) => (r(), e("svg", {
			role: "img",
			"aria-label": "Cloudflare",
			class: n([a.root])
		}, null, 2));
	}
});
//#endregion
export { i as default };
