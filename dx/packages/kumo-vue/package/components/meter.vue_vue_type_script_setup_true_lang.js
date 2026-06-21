import { Fragment as e, createCommentVNode as t, createElementBlock as n, createElementVNode as r, createTextVNode as i, defineComponent as a, normalizeClass as o, openBlock as s, toDisplayString as c } from "vue";
//#region generated/libraries/vue/components/meter.vue?vue&type=script&setup=true&lang.ts
var l = /*@__PURE__*/ a({
	__name: "meter",
	props: {
		className: {},
		customValue: {},
		indicatorClassName: {},
		label: {},
		max: { default: 100 },
		min: { default: 0 },
		showValue: {
			type: Boolean,
			default: !0
		},
		trackClassName: {},
		value: {}
	},
	emits: [],
	setup(a, { emit: l }) {
		let u = a, d = { root: "kumo-meter-root" };
		return (a, l) => (s(), n("div", { class: o([d.root]) }, [
			i(c(u.label), 1),
			r("meter", { class: o([d.root]) }, null, 2),
			u.showValue ? (s(), n(e, { key: 0 }, [i(c(u.customValue ?? u.value), 1)], 64)) : t("v-if", !0)
		], 2));
	}
});
//#endregion
export { l as default };
