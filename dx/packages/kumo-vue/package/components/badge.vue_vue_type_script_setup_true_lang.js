import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/badge.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "badge",
	props: {
		appearance: { default: "filled" },
		children: {},
		className: {},
		variant: { default: "primary" }
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-badge-root" };
		return (t, a) => (r(), e("span", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
