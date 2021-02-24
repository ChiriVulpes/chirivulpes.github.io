export type ArrayOr<T> = T | T[];

export function tuple<TUPLE extends any[]> (...tuple: TUPLE) {
	return tuple;
}

export module tuple {
	export const string = TupleType<string>().create;
	export const number = TupleType<number>().create;
}

export function TupleType<T> () {
	return {
		create<TUPLE extends T[]> (...tuple: TUPLE) {
			return tuple;
		},
	};
}
