import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/table.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "table",
	props: {
		children: {},
		className: {},
		layout: { default: "auto" }
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-table-root" };
		return (t, a) => (r(), e("table", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
