import { createElementBlock as e, createElementVNode as t, defineComponent as n, normalizeClass as r, onMounted as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/toasty.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-part": "root" }, l = { "data-kumo-part": "collection" }, u = /*@__PURE__*/ n({
	__name: "toasty",
	props: {
		children: {},
		container: { default: "provider container or document.body" },
		toastManager: {},
		variant: { default: "default" }
	},
	emits: ["change"],
	setup(n, { emit: u }) {
		let d = { root: "kumo-toasty-root" };
		return o(void 0), i(() => {}), (n, i) => (a(), e("div", {
			"data-kumo-compound": "toasty",
			class: r(d.root)
		}, [t("section", c, [s(n.$slots, "root")]), t("section", l, [s(n.$slots, "collection")])], 2));
	}
});
//#endregion
export { u as default };
