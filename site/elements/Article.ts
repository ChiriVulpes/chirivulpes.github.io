import Element, { Initialiser } from "@element/Element";
import Heading from "@element/Heading";
import Link from "@element/Link";
import Nav from "@element/Nav";
import { createID, HrefFile } from "@util/Strings";

export default class Article extends Element {

	protected heading = new Heading(2)
		.appendTo(this);

	protected _header = new ArticleHeader()
		.appendTo(this);

	public constructor (title: string, link?: HrefFile) {
		super("article");
		const id = link === undefined ? createID(title) : undefined;
		new Link(link ?? `#${id!}` as const)
			.text(title)
			.appendTo(this.heading.id(id));
	}

	public header (initialiser: Initialiser<ArticleHeader>) {
		initialiser(this._header);
		return this;
	}
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
