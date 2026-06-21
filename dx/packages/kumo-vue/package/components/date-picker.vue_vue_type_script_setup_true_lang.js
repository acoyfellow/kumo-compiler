import { Teleport as e, createBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/date-picker.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-layer": "date-picker" }, l = { "data-kumo-part": "date-picker" }, u = /*@__PURE__*/ r({
	__name: "date-picker",
	props: {
		"aria-label": {},
		fromDate: {},
		mode: {},
		onChange: {},
		reactDayPickerProps: {},
		selected: {},
		toDate: {}
	},
	emits: [
		"onChange",
		"update:selected",
		"change"
	],
	setup(r, { emit: u }) {
		let d = { root: "kumo-date-picker-root" };
		return o(void 0), (r, o) => (a(), t(e, { to: "document-body" }, [n("div", c, [n("div", {
			"data-kumo-compound": "date-picker",
			class: i(d.root)
		}, [n("section", l, [s(r.$slots, "date-picker")])], 2)])]));
	}
});
//#endregion
export { u as default };
