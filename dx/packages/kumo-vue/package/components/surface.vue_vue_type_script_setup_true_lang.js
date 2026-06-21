import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/surface.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "surface",
	props: {
		as: {},
		children: {},
		className: {},
		color: { default: "primary" },
		render: {}
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-surface-root" };
		return (t, a) => (r(), e("div", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
