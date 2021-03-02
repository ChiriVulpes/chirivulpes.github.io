import { AnyFunction } from "@util/Type";

export default function <T extends AnyFunction> (target: any, key: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
	const fn = descriptor.value;

	return {
		configurable: true,
		get () {
			// eslint-disable-next-line no-prototype-builtins, @typescript-eslint/no-unsafe-member-access
			if (!this || this === target.prototype || this.hasOwnProperty(key) || typeof fn !== "function") {
				return fn as T;
			}

			const boundFn = fn.bind(this);
			Object.defineProperty(this, key, {
				configurable: true,
				value: boundFn,
			});

			return boundFn as T;
		},
	};
}
