import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, ref as i, renderSlot as a } from "vue";
//#region generated/libraries/vue/components/label.vue?vue&type=script&setup=true&lang.ts
var o = /*@__PURE__*/ t({
	__name: "label",
	props: {
		asContent: {
			type: Boolean,
			default: !1
		},
		children: {},
		className: {},
		htmlFor: {},
		showOptional: {
			type: Boolean,
			default: !1
		},
		tooltip: {}
	},
	emits: [],
	setup(t, { emit: o }) {
		let s = { root: "kumo-label-root" };
		return i(null), (t, i) => (r(), e("label", { class: n([s.root]) }, [a(t.$slots, "default")], 2));
	}
});
//#endregion
export { o as default };
