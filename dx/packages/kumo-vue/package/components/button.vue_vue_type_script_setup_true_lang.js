import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r } from "vue";
//#region generated/libraries/vue/components/button.vue?vue&type=script&setup=true&lang.ts
var i = /*@__PURE__*/ t({
	__name: "button",
	props: {
		disabled: { type: Boolean },
		icon: {},
		loading: {
			type: Boolean,
			default: !1
		},
		native: {},
		shape: { default: "base" },
		size: { default: "base" },
		variant: { default: "secondary" }
	},
	emits: ["change"],
	setup(t, { emit: i }) {
		let a = { root: "kumo-button-root" };
		return (t, i) => (r(), e("button", { class: n([a.root]) }, null, 2));
	}
});
//#endregion
export { i as default };
