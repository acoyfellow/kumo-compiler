import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, ref as i } from "vue";
//#region generated/libraries/vue/components/switch.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "switch",
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
		label: {},
		onCheckedChange: {},
		size: { default: "base" }
	},
	emits: ["onCheckedChange", "change"],
	setup(t, { emit: a }) {
		let o = { root: "kumo-switch-root" };
		return i(void 0), (t, i) => (r(), e("button", { class: n([o.root]) }, null, 2));
	}
});
//#endregion
export { a as default };
