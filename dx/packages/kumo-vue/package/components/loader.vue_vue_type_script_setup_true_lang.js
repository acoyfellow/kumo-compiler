import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r } from "vue";
//#region generated/libraries/vue/components/loader.vue?vue&type=script&setup=true&lang.ts
var i = ["aria-label"], a = /*@__PURE__*/ t({
	__name: "loader",
	props: {
		"aria-label": { default: "Loading" },
		className: {},
		size: { default: "base" }
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = t, s = { root: "kumo-loader-root" };
		return (t, a) => (r(), e("span", {
			role: "status",
			"aria-label": o.aria_label,
			class: n([s.root])
		}, null, 10, i));
	}
});
//#endregion
export { a as default };
