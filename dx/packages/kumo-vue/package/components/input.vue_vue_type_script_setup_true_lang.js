import { createElementBlock as e, defineComponent as t, normalizeClass as n, openBlock as r, ref as i } from "vue";
//#region generated/libraries/vue/components/input.vue?vue&type=script&setup=true&lang.ts
var a = /*@__PURE__*/ t({
	__name: "input",
	props: { observable: {} },
	emits: ["change"],
	setup(t, { emit: a }) {
		let o = { root: "kumo-input-root" };
		return i(null), (t, i) => (r(), e("input", { class: n([o.root]) }, null, 2));
	}
});
//#endregion
export { a as default };
