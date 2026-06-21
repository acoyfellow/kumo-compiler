import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, onMounted as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/sidebar.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-part": "root" }, l = { "data-kumo-part": "collection" }, u = /*@__PURE__*/ n({
	__name: "sidebar",
	props: {
		Collapsible: {},
		CollapsibleTrigger: {},
		MenuButton: {},
		MenuSubButton: {},
		Provider: {},
		root: {},
		SlidingView: {},
		SlidingViews: {}
	},
	emits: ["change"],
	setup(n, { emit: u }) {
		let d = { root: "kumo-sidebar-root" };
		return o(!1), o(null), i(() => {}), (n, i) => (a(), e("div", {
			"data-kumo-compound": "sidebar",
			class: r(d.root)
		}, [t("section", c, [s(n.$slots, "root")]), t("section", l, [s(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { u as default };
