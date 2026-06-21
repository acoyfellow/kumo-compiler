import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/layer-card.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "layer-card",
	props: {
		children: {},
		className: {},
		render: {}
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-layer-card-root" };
		return (t, a) => (r(), e("div", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
