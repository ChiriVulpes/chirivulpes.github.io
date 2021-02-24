export type ArrayOr<T> = T | T[];

export function tuple<TUPLE extends any[]> (...tuple: TUPLE) {
	return tuple;
}

export namespace tuple {
	/* eslint-disable @typescript-eslint/unbound-method */
	export const string = TupleType<string>().create;
	export const number = TupleType<number>().create;
	/* eslint-enable @typescript-eslint/unbound-method */
}

export function TupleType<T> () {
	return {
		create<TUPLE extends T[]> (...tuple: TUPLE) {
			return tuple;
		},
	};
}
