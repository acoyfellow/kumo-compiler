import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, openBlock as i, ref as a, renderSlot as o } from "vue";
//#region generated/libraries/vue/components/tabs.vue?vue&type=script&setup=true&lang.ts
var s = { "data-kumo-part": "root" }, c = { "data-kumo-part": "collection" }, l = /*@__PURE__*/ n({
	__name: "tabs",
	props: {
		activateOnFocus: {
			type: Boolean,
			default: !1
		},
		className: {},
		indicatorClassName: {},
		listClassName: {},
		onValueChange: {},
		selectedValue: { default: "first tab value when uncontrolled and selectedValue omitted" },
		size: { default: "base" },
		tabs: { default: [] },
		value: {},
		variant: { default: "segmented" }
	},
	emits: ["onValueChange", "change"],
	setup(n, { emit: l }) {
		let u = { root: "kumo-tabs-root" };
		return a(void 0), a(null), (n, a) => (i(), e("div", {
			"data-kumo-compound": "tabs",
			class: r(u.root)
		}, [t("section", s, [o(n.$slots, "root")]), t("section", c, [o(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { l as default };
