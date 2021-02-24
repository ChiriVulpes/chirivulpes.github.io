import Log from "../../../shared/utilities/Log";
import Element from "../Element";
import { tuple } from "../type/Arrays";

export enum MetaLinkType {
	SiteIcon = "shortcut icon",
	Preconnect = "preconnect",
}

export const metaLinkTypeAttributes = {
	[MetaLinkType.SiteIcon]: tuple.string("href"),
	[MetaLinkType.Preconnect]: tuple.string("href"),
};

export interface MetaLinkAttributeMap {
	[MetaLinkType.SiteIcon]: {
		href: string;
	};
	[MetaLinkType.Preconnect]: {
		href: `https://${string}`;
	};
}

// verify that all metalinktypes are represented in `metaLinkTypeAttributes`
const _1: Record<MetaLinkType, string[]> = metaLinkTypeAttributes; _1;
// verify that all attributes are represented in `MetaLinkAttributeMap`
const _2: { [T in MetaLinkType]: Record<AttributeTuple<T>[number], string> } = 0 as any as MetaLinkAttributeMap; _2;

type AttributeTuple<T extends MetaLinkType> = Extract<(typeof metaLinkTypeAttributes)[T], string[]>;
type AttributeValueTuple<T extends MetaLinkType, MAPPED = MetaLinkAttributeMap[T], ATTRS extends [...string[]] = AttributeTuple<T>> = Extract<{ [I in keyof ATTRS]: MAPPED[Extract<ATTRS[I], keyof MAPPED>] }, [...string[]]>;


export default class MetaLink<T extends MetaLinkType> extends Element {
	public constructor (type: T, ...values: AttributeValueTuple<T>) {
		super("link");
		this.attribute("rel", type);

		const attributes = metaLinkTypeAttributes[type];
		if (attributes.length !== values.length)
			Log.warn("Incorrect number of attributes given to MetaLink — expected", attributes, "got", values);

		for (let i = 0; i < values.length; i++)
			this.attribute(attributes[i], values[i]);
	}
}
