import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, onMounted as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/select.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-part": "root" }, l = { "data-kumo-part": "collection" }, u = /*@__PURE__*/ n({
	__name: "select",
	props: {
		"aria-label/aria-labelledby": {},
		children: {},
		container: {},
		hideLabel: { type: Boolean },
		items: {},
		label: {},
		"labelTooltip/description/error": {},
		"placeholder/loading/disabled/required": {},
		renderValue: {},
		Root: {},
		size: { default: "base" }
	},
	emits: [
		"update:open",
		"update:value",
		"change"
	],
	setup(n, { emit: u }) {
		let d = { root: "kumo-select-root" };
		return o(void 0), o(null), i(() => {}), (n, i) => (a(), e("div", {
			"data-kumo-compound": "select",
			class: r(d.root)
		}, [t("section", c, [s(n.$slots, "root")]), t("section", l, [s(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { u as default };
