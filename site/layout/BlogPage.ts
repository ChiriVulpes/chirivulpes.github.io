import Element, { FileFragment } from "@element/Element";
import Link from "@element/Link";
import DefaultPage from "@layout/DefaultPage";
import { Metadata } from "site/Page";

export const BLOG_TITLE = "Chiri's Blog";
export const BLOG_TAGLINE = "Where a fox goes to ramble!";

export default class BlogPage extends DefaultPage {
	public constructor () {
		super();

		this.metadata.setDescription(BLOG_TAGLINE);

		this.requireStyles("page/blog");

		this.header(header => header
			.homeLink(homeLink => homeLink
				.anchor("/blog")
				.dump()
				.append(new Element().text(BLOG_TITLE))
				.append(new Element()
					.append(new Element("span").setAriaHidden().text(BLOG_TITLE))
					.append(new Link("/rss/blog.xml")
						.setAriaLabel("RSS Feed")
						.class("rss-link")
						.append(new FileFragment("/static/image/rss.svg")
							.onPrecompile((svg, element) => element.html(svg))))))
			.tagline(tagline => tagline
				.text(BLOG_TAGLINE))
			.nav(nav => nav
				.prepend(new Link("/").text("Portfolio"))));
	}

	public getTitle () {
		const existingTitle = this.metadata.title!;
		return Metadata.createTitle(existingTitle, ...existingTitle.includes(BLOG_TITLE) ? [] : [BLOG_TITLE]);
	}
}
