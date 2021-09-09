import Define from "./Define";

declare global {
	interface Array<T> {
		collect<ARGS extends any[], RETURN> (collector: (arr: this, ...args: ARGS) => RETURN, ...args: ARGS): RETURN;
		splat<ARGS extends any[], RETURN> (collector: (...arr: [...this, ...ARGS]) => RETURN, ...args: ARGS): RETURN;
	}
}

export default function () {
	Define(Array.prototype, "collect", function (this: any[], collector, ...args) {
		return collector(this, ...args);
	});
	Define(Array.prototype, "splat", function (this: any[], collector, ...args) {
		return collector(...this, ...args);
	});
}
