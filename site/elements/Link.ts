import Element from "@element/Element";
import { Href } from "@util/Strings";
import Links from "site/Links";

export default class Link extends Element {
	public constructor (link: keyof typeof Links);
	public constructor (href: Href);
	public constructor (href: Href | keyof typeof Links) {
		super("a");

		const link = Links[href as keyof typeof Links];
		if (link !== undefined) {
			this.text(href);
			href = link;
		}

		this.attribute("href", href);
		if (href.startsWith("/"))
			this.class("local-link");
		if (href.startsWith("#"))
			this.class("hash-link");
	}
}
