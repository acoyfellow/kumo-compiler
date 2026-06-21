import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, onMounted as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/pagination.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-part": "root" }, l = { "data-kumo-part": "collection" }, u = /*@__PURE__*/ n({
	__name: "pagination",
	props: {
		compound: {},
		controls: { default: "full" },
		labels: { default: "English canonical labels" },
		page: { default: 1 },
		pageSelector: { default: "input" },
		perPage: {},
		setPage: {},
		totalCount: {}
	},
	emits: ["update:page", "change"],
	setup(n, { emit: u }) {
		let d = { root: "kumo-pagination-root" };
		return o(void 0), i(() => {}), (n, i) => (a(), e("div", {
			"data-kumo-compound": "pagination",
			class: r(d.root)
		}, [t("section", c, [s(n.$slots, "root")]), t("section", l, [s(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { u as default };
