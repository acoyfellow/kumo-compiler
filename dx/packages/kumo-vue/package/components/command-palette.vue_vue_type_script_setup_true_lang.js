import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, onMounted as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/command-palette.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-part": "root" }, l = { "data-kumo-part": "collection" }, u = /*@__PURE__*/ n({
	__name: "command-palette",
	props: {
		compound: {},
		Dialog: {},
		Input: {},
		Panel: {},
		Root: {}
	},
	emits: ["update:open", "change"],
	setup(n, { emit: u }) {
		let d = { root: "kumo-command-palette-root" };
		return o(!0), o(null), i(() => {}), (n, i) => (a(), e("div", {
			"data-kumo-compound": "command-palette",
			class: r(d.root)
		}, [t("section", c, [s(n.$slots, "root")]), t("section", l, [s(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { u as default };
