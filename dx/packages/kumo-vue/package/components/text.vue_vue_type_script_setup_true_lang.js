import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/text.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "text",
	props: {
		as: {},
		bold: {
			type: Boolean,
			default: !1
		},
		children: {},
		DANGEROUS_className: {},
		DANGEROUS_style: {},
		size: { default: "base" },
		truncate: {
			type: Boolean,
			default: !1
		},
		variant: { default: "body" }
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = { root: "kumo-text-root" };
		return (t, a) => (r(), e("span", { class: n([o.root]) }, [i(t.$slots, "default")], 2));
	}
});
//#endregion
export { a as default };
