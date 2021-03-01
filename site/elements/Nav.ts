import Element, { Initialiser } from "@element/Element";
import Link from "@element/Link";
import { Href } from "@util/Strings";
import Links from "site/Links";

export default class Nav extends Element {
	public constructor () {
		super("nav");
	}

	public link (link: keyof typeof Links, initialiser?: Initialiser<Link>): this;
	public link (text: string, href: Href, initialiser?: Initialiser<Link>): this;
	public link (text: string, href?: Href | Initialiser<Link>, initialiser?: Initialiser<Link>) {
		if (typeof href === "function")
			initialiser = href, href = undefined;

		const link = href === undefined
			? new Link(text as keyof typeof Links)
			: new Link(href).text(text);

		initialiser?.(link);
		return this.append(link);
	}

	public break () {
		return this.append(new Element("br"));
	}
}