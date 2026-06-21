import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, renderSlot as i } from "vue";
//#region generated/libraries/vue/components/link.vue?vue&type=script&setup=true&lang.ts
var a = ["href"], o = /*@__PURE__*/ t({
	__name: "link",
	props: {
		children: {},
		className: {},
		href: {},
		render: {},
		variant: { default: "inline" }
	},
	emits: [],
	setup(t, { emit: o }) {
		let s = t, c = { root: "kumo-link-root" };
		return (t, o) => (r(), e("a", {
			href: s.href,
			class: n([c.root])
		}, [i(t.$slots, "default")], 10, a));
	}
});
//#endregion
export { o as default };
