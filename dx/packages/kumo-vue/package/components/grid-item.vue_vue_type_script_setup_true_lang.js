import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/grid-item.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "grid-item",
	props: {
		children: {},
		className: {}
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-grid-item-root" };
		return (t, a) => (r(), e("div", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
