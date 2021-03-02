import Element, { Initialiser } from "@element/Element";
import Heading from "@element/Heading";
import Image from "@element/Image";
import Thumbnail from "@element/Thumbnail";
import { HrefFile } from "@util/Strings";

export default class Card extends Element {

	protected readonly header: CardHeader;

	public constructor (title: string, link?: HrefFile) {
		super();
		this.class("card");
		this.header = new CardHeader(title)
			.appendTo(this);

		if (link !== undefined)
			this.setLink(link);
	}

	public isInline () {
		return false;
	}

	public setLink (link: HrefFile) {
		this.type = "a";
		this.attribute("href", link);
		return this;
	}

	public setImage (image?: Image | Thumbnail) {
		image?.prependTo(this);
		return this;
	}

	public details (initialiser: Initialiser<Element>) {
		initialiser(this.header.details);
		return this;
	}
}

export class CardHeader extends Element {
	public readonly title = new Heading(4)
		.appendTo(this);

	public readonly details = new Element()
		.class("details")
		.setOnlyRenderWithContent()
		.appendTo(this);

	public constructor (title: string) {
		super("header");
		this.title.text(title);
	}
}