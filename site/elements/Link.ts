import Element, { FileFragment } from "@element/Element";
import { Href } from "@util/string/Strings";
import Links from "site/Links";

export default class Link extends Element {
	public constructor (link: keyof typeof Links);
	public constructor (href: Href);
	public constructor (href: Href | keyof typeof Links) {
		super("a");
		this.anchor(href as Href);
	}

	public setSimple () {
		this.classes.delete("local-link");
		this.classes.delete("hash-link");
		return this;
	}

	public anchor (link: keyof typeof Links): this;
	public anchor (href: Href): this;
	public anchor (href: Href | keyof typeof Links) {
		const link = Links[href as keyof typeof Links];
		if (link !== undefined) {
			this.text(href);
			href = link;
		}

		this.attribute("href", href);
		if (href.startsWith("/")) {
			this.class("local-link");
			this.classes.delete("hash-link");
		}

		if (href.startsWith("#")) {
			this.class("hash-link");
			this.classes.delete("local-link");
		}

		if (href.endsWith("/rss.xml")) {
			this.setAriaLabel("RSS Feed")
				.class("rss-link")
				.append(new FileFragment("/static/image/rss.svg")
					.onPrecompile((svg, element) => element.html(svg)));
		}

		return this;
	}
}
