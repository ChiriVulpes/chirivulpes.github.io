import Element, { Initialiser, Text } from "@element/Element";
import { HrefLocal } from "@util/string/Strings";
import Page from "site/Page";

export default class RSSPage extends Page {
	public constructor () {
		super();
		this.setType("feed");
		this.dump();
		this._attributes = {};
		this.appendsTo = this;
		this.attribute("xmlns", "http://www.w3.org/2005/Atom")
	}

	private link?: HrefLocal;
	public setLink (link: HrefLocal) {
		this.link = link;
		return this;
	}

	private author?: string;
	public setAuthor (author: string) {
		this.author = author;
		return this;
	}

	public addAll<E extends Element> (content: readonly E[], initialiser: Initialiser<RSSEntry, [E]>) {
		for (const element of content)
			new RSSEntry()
				.init(initialiser, element)
				.appendTo(this);
	}

	protected async precompile (indent: boolean) {
		await super.precompile(indent);

		if (this.author)
			this.prepend(new Element("author")
				.append(new Element("name")
					.text(this.author)));

		this.prepend(new Element("id")
			.text(this.link ?? this.metadata.title ?? uuid(), true));

		const latestEntry = this.children.find((entry): entry is RSSEntry => entry instanceof RSSEntry);
		if (latestEntry?.publishedTime)
			this.prepend(new Element("updated")
				.text(latestEntry.publishedTime.toISOString()));

		if (this.link)
			this.prepend(new Element("link")
				.attribute("href", this.link));

		this.head.children.find((child): child is Element => child instanceof Element && child.type === "title")
			?.prependTo(this)
			.children.map(child => child instanceof Text ? child.setCDATA() : child);

	}

	protected getDocType () {
		return "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
	}
}


function s4 () {
	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function uuid () {
	return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export class RSSEntry extends Element {

	public constructor () {
		super("entry");
	}

	public title?: string;
	public setTitle (title: string) {
		this.title = title;
		return this;
	}

	public link?: HrefLocal;
	public setLink (link: HrefLocal) {
		this.link = link;
		return this;
	}

	public publishedTime?: Date;
	public setPublishedTime (publishedTime?: Date) {
		this.publishedTime = publishedTime;
		return this;
	}

	protected precompile (indent: boolean) {
		super.precompile?.(indent);

		if (this.title)
			this.append(new Element("title")
				.text(this.title, true));

		if (this.link)
			this.append(new Element("link")
				.attribute("href", this.link));

		if (this.publishedTime)
			this.append(new Element("updated")
				.text(this.publishedTime.toISOString()));

		this.append(new Element("id")
			.text(this.link ?? this.title ?? uuid(), true));
	}
}
