import { Teleport as e, createBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, onMounted as a, openBlock as o, ref as s, renderSlot as c } from "vue";
//#region generated/libraries/vue/components/popover.vue?vue&type=script&setup=true&lang.ts
var l = { "data-kumo-layer": "popover" }, u = { "data-kumo-part": "popover" }, d = /*@__PURE__*/ r({
	__name: "popover",
	props: {
		Close: {},
		Content: {},
		Root: {},
		"Title/Description": {},
		Trigger: {}
	},
	emits: ["update:open", "change"],
	setup(r, { emit: d }) {
		let f = { root: "kumo-popover-root" };
		return s(void 0), a(() => {}), (r, a) => (o(), t(e, { to: "document-body" }, [n("div", l, [n("div", {
			"data-kumo-compound": "popover",
			class: i(f.root)
		}, [n("section", u, [c(r.$slots, "popover")])], 2)])]));
	}
});
//#endregion
export { d as default };
