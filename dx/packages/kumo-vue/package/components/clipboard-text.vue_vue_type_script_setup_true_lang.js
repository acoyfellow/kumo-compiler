import { createBlock as e, defineComponent as t, normalizeClass as n, onMounted as r, openBlock as i, ref as a, resolveComponent as o } from "vue";
//#region generated/libraries/vue/components/clipboard-text.vue?vue&type=script&setup=true&lang.ts
var s = /*@__PURE__*/ t({
	__name: "clipboard-text",
	props: { observable: {} },
	emits: ["change"],
	setup(t, { emit: s }) {
		let c = { root: "kumo-clipboard-text-root" };
		return a(null), r(() => {}), (t, r) => {
			let a = o("clipboard-text", !0);
			return i(), e(a, { class: n([c.root]) }, null, 8, ["class"]);
		};
	}
});
//#endregion
export { s as default };
