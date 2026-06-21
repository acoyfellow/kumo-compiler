import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, ref as i } from "vue";
//#region generated/libraries/vue/components/checkbox.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "checkbox",
	props: {
		checked: {
			type: Boolean,
			default: !1
		},
		disabled: {
			type: Boolean,
			default: !1
		},
		group: {},
		indeterminate: {
			type: Boolean,
			default: !1
		},
		label: {},
		onCheckedChange: {}
	},
	emits: ["onCheckedChange", "change"],
	setup(t, { emit: a }) {
		let o = { root: "kumo-checkbox-root" };
		return i(void 0), (t, i) => (r(), e("input", { class: n([o.root]) }, null, 2));
	}
});
//#endregion
export { a as default };
