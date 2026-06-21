import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/breadcrumbs.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "breadcrumbs",
	props: {
		children: {},
		className: {},
		size: { default: "base" }
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-breadcrumbs-root" };
		return (t, a) => (r(), e("nav", {
			"aria-label": "Breadcrumbs",
			class: n([o.root])
		}, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
