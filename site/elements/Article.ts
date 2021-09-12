import Card from "@element/Card";
import Element, { Heading, Initialiser, NodeContainer } from "@element/Element";
import Link from "@element/Link";
import Nav from "@element/Nav";
import Files from "@util/Files";
import { PickValue } from "@util/Objects";
import { createID, HrefFile } from "@util/string/Strings";
import { Class } from "@util/Type";

export interface IHasCard {
	createCard (into: NodeContainer): Card;
	getOrder (): number[];
}

export default class Article<T extends IHasCard = IHasCard, S extends string = string> extends Element {

	protected _heading = new Heading(3)
		.appendTo(this);

	protected _header = new ArticleHeader()
		.appendTo(this);

	public cardSources: T[] = [];

	public constructor (public readonly title: string, public readonly link?: HrefFile) {
		super("article");
		const id = link === undefined ? createID(title) : undefined;
		new Link(link ?? `#${id!}` as const)
			.text(title)
			.appendTo(this._heading.id(id));

		this.requireScripts("article");
	}

	public header (initialiser: Initialiser<ArticleHeader>) {
		initialiser(this._header);
		return this;
	}

	public heading (initialiser: Initialiser<Heading>) {
		initialiser(this._heading);
		return this;
	}

	public publishedTime?: Date;
	public setPublishedTime (publishedTime?: Date) {
		this.publishedTime = publishedTime;
		return this;
	}

	private readonly sections: Partial<Record<S, ArticleSection | undefined>> = {};
	public addSection (title: S, initialiser?: Initialiser<ArticleSection>) {
		const section = new ArticleSection(title).appendTo(this);
		this.sections[title] = section;
		initialiser?.(section);
		return this;
	}

	private containsCards?: { cls: Class<T>, directory: string, sectionProperty: string };
	public setContainsCards (cls: Class<T>, directory: string, sectionProperty: Extract<keyof PickValue<T, string>, string>) {
		this.containsCards = { cls, directory, sectionProperty };
		return this;
	}

	protected async precompile () {
		const containsCards = this.containsCards;
		if (containsCards === undefined)
			return;

		const cardSources = this.cardSources = (await Files.discoverClasses(containsCards.cls, containsCards.directory))
			.map(source => source.value);

		const results = cardSources
			.map(instance => ({ instance, order: instance.getOrder() }))
			.sort(sortByOrder);

		for (const { instance } of results) {
			const property = (instance as any as Record<string, string>)[containsCards.sectionProperty] as S;
			let section = this.sections[property];
			if (section === undefined)
				this.addSection(property, s => this.sections[property] = section = s);

			const card = instance.createCard(section!);
			if (!section!.children.includes(card))
				section!.append(card);
		}
	}
}

function sortByOrder ({ order: orderA }: { order: number[] }, { order: orderB }: { order: number[] }) {
	const length = Math.max(orderA.length, orderB.length);
	for (let i = 0; i < length; i++) {
		const oA = orderA[i] ?? 0;
		const oB = orderB[i] ?? 0;
		if (oA !== oB)
			return oB - oA;
	}

	return 0;
}

export class ArticleHeader extends Element {

	protected nav?: Nav;

	public constructor () {
		super("header");
		this.setOnlyRenderWithContent();
	}

	public setNav (initialiser: Initialiser<Nav>) {
		const nav = this.nav = new Nav().appendTo(this);
		initialiser(nav);
		return this;
	}
}

export class ArticleSection extends Element {

	protected heading = new Heading(4)
		.appendTo(this);

	public constructor (title: string) {
		super("section");
		this.heading.id(createID(title)).text(title);
	}
}
