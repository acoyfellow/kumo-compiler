import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, toDisplayString as i } from "vue";
//#region generated/libraries/vue/components/code.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "code",
	props: {
		className: {},
		code: {},
		lang: { default: "ts" },
		style: {},
		values: {}
	},
	emits: [],
	setup(t, { emit: a }) {
		let o = t, s = { root: "kumo-code-root" };
		return (t, a) => (r(), e("code", { class: n([s.root]) }, i(o.code), 3));
	}
});
//#endregion
export { a as default };
