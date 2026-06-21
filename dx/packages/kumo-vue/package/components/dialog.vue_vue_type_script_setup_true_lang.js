import { Teleport as e, createBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, onMounted as a, openBlock as o, ref as s, renderSlot as c } from "vue";
//#region generated/libraries/vue/components/dialog.vue?vue&type=script&setup=true&lang.ts
var l = { "data-kumo-layer": "dialog" }, u = { "data-kumo-part": "dialog" }, d = /*@__PURE__*/ r({
	__name: "dialog",
	props: {
		Close: {},
		Description: {},
		Dialog: {},
		Root: {},
		Title: {},
		Trigger: {}
	},
	emits: ["update:open", "change"],
	setup(r, { emit: d }) {
		let f = { root: "kumo-dialog-root" };
		return s(void 0), s(null), a(() => {}), (r, a) => (o(), t(e, { to: "document-body" }, [n("div", l, [n("div", {
			"data-kumo-compound": "dialog",
			class: i(f.root)
		}, [n("section", u, [c(r.$slots, "dialog")])], 2)])]));
	}
});
//#endregion
export { d as default };
