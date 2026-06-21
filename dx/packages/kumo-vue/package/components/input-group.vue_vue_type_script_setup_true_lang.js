import { createBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, ref as i, resolveComponent as a } from "vue";
//#region generated/libraries/vue/components/input-group.vue?vue&type=script&setup=true&lang.ts
var o = /*@__PURE__*/ t({
	__name: "input-group",
	props: { observable: {} },
	emits: ["change"],
	setup(t, { emit: o }) {
		let s = { root: "kumo-input-group-root" };
		return i(null), (t, i) => {
			let o = a("input-group", !0);
			return r(), e(o, { class: n([s.root]) }, null, 8, ["class"]);
		};
	}
});
//#endregion
export { o as default };
