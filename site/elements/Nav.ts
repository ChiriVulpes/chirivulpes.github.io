import Element from "@element/Element";
import Link from "@element/Link";
import { Href } from "@util/Strings";

export default class Nav extends Element {
	public constructor () {
		super("nav");
	}

	public link (text: string, href: Href) {
		return this.append(new Link(href)
			.text(text));
	}

	public break () {
		return this.append(new Element("br"));
	}
}
