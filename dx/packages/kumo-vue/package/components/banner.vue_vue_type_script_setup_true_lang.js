import { createElementBlock as e, createTextVNode as t, defineComponent as n, normalizeClass as r, openBlock as i, renderSlot as a, toDisplayString as o } from "vue";
//#region generated/libraries/vue/components/banner.vue?vue&type=script&setup=true&lang.ts
var s = /*@__PURE__*/ n({
	__name: "banner",
	props: {
		action: {},
		children: {},
		className: {},
		description: {},
		icon: {},
		text: {},
		title: {},
		variant: { default: "default" }
	},
	emits: [],
	setup(n, { emit: s }) {
		let c = n, l = { root: "kumo-banner-root" };
		return (n, s) => (i(), e("section", { class: r([l.root]) }, [
			a(n.$slots, "icon"),
			t(o(c.title), 1),
			a(n.$slots, "description"),
			a(n.$slots, "action"),
			a(n.$slots, "default")
		], 2));
	}
});
//#endregion
export { s as default };
