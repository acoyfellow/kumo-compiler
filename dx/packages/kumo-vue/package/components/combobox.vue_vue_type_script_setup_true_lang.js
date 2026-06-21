import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, openBlock as i, ref as a, renderSlot as o } from "vue";
//#region generated/libraries/vue/components/combobox.vue?vue&type=script&setup=true&lang.ts
var s = { "data-kumo-part": "root" }, c = { "data-kumo-part": "collection" }, l = /*@__PURE__*/ n({
	__name: "combobox",
	props: {
		compound: {},
		Content: {},
		root: {},
		TriggerInput: {},
		TriggerMultipleWithInput: {},
		variants: {}
	},
	emits: ["update:open", "change"],
	setup(n, { emit: l }) {
		let u = { root: "kumo-combobox-root" };
		return a(void 0), a(null), (n, a) => (i(), e("div", {
			"data-kumo-compound": "combobox",
			class: r(u.root)
		}, [t("section", s, [o(n.$slots, "root")]), t("section", c, [o(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { l as default };
