import { Teleport as e, createBlock as t, createElementVNode as n, defineComponent as r, normalizeClass as i, openBlock as a, ref as o, renderSlot as s } from "vue";
//#region generated/libraries/vue/components/date-range-picker.vue?vue&type=script&setup=true&lang.ts
var c = { "data-kumo-layer": "date-range-picker" }, l = { "data-kumo-part": "date-range-picker" }, u = /*@__PURE__*/ r({
	__name: "date-range-picker",
	props: {
		className: {},
		onEndDateChange: {},
		onStartDateChange: {},
		size: { default: "base" },
		timezone: { default: "New York, NY, USA (GMT-4)" },
		variant: { default: "default" }
	},
	emits: [
		"onEndDateChange",
		"onStartDateChange",
		"update:endDate",
		"update:startDate",
		"change"
	],
	setup(r, { emit: u }) {
		let d = { root: "kumo-date-range-picker-root" };
		return o(void 0), (r, o) => (a(), t(e, { to: "document-body" }, [n("div", c, [n("div", {
			"data-kumo-compound": "date-range-picker",
			class: i(d.root)
		}, [n("section", l, [s(r.$slots, "date-range-picker")])], 2)])]));
	}
});
//#endregion
export { u as default };
