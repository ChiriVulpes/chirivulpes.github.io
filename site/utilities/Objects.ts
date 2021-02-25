import { UnionToIntersection } from "./Type";

export type PickValue<Base, Condition> = Pick<Base, {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never
}[keyof Base]>;

export type PickNotValue<Base, Condition> = Pick<Base, {
	[Key in keyof Base]: Base[Key] extends Condition ? never : Key
}[keyof Base]>;

export type PickValueAndNotValue<Base, Condition, NotCondition> = Pick<Base, {
	[Key in keyof Base]: Base[Key] extends Condition ? Base[Key] extends NotCondition ? never : Key : never
}[keyof Base]>;

export type PickValueOrNotValue<Base, Condition, NotCondition> = Pick<Base, {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : Base[Key] extends NotCondition ? never : Key
}[keyof Base]>;

export type Join<A, B, SEP extends string> = A extends string | number ? B extends string | number ?
	`${A}${"" extends B ? "" : SEP}${B}`
	: never : never;

export type Flatten<T extends object, SEP extends string> =
	PickValueOrNotValue<T, any[], object>
	& Flatten2<PickValueAndNotValue<T, object, any[]>, SEP>;

type Flatten2<T extends object, SEP extends string> =
	UnionToIntersection<{ [K in keyof T]: Flatten3<Extract<T[K], object>, Extract<K, string>, SEP> }[keyof T] | {}>;

type Flatten3<T extends object, PARENT extends string, SEP extends string> =
	Flatten<{ [K in keyof T as `${PARENT}${SEP}${Extract<K, string>}`]: T[K] }, SEP>;
