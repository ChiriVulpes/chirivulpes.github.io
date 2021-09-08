export default class Type<T> { }
export type GetType<TYPE extends Type<any>> = TYPE extends Type<infer T> ? T : never;

export type UnionToIntersection<U> =
	(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export type Class<T> = new (...args: any[]) => T;

export type AnyFunction = (...args: any[]) => any;

export type PromiseOr<T> = T | Promise<T>;
