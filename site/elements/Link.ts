import Element from "@element/Element";
import { Href } from "@util/Strings";

export default class Link extends Element {
	public constructor (href: Href) {
		super("a");
		this.attribute("href", href);
		if (href.startsWith("/"))
			this.class("local-link");
		if (href.startsWith("#"))
			this.class("hash-link");
	}
}
