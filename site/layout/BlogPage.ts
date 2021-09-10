import Element, { FileFragment } from "@element/Element";
import Link from "@element/Link";
import DefaultPage from "@layout/DefaultPage";
import { Metadata } from "site/Page";

const TITLE = "Chiri's Blog";
const TAGLINE = "Where a fox goes to ramble!";

export default class BlogPage extends DefaultPage {
	public constructor () {
		super();

		this.metadata.setTitle(TITLE, TAGLINE)
		this.metadata.setDescription(TAGLINE);

		this.requireStyles("page/blog");

		this.header(header => header
			.homeLink(homeLink => homeLink
				.anchor("/blog")
				.dump()
				.append(new Element().text(TITLE))
				.append(new Element()
					.append(new Element("span").setAriaHidden().text(TITLE))
					.append(new Link("/rss/blog.xml")
						.setAriaLabel("RSS Feed")
						.class("rss-link")
						.append(new FileFragment("/static/image/rss.svg")
							.onPrecompile((svg, element) => element.html(svg))))))
			.tagline(tagline => tagline
				.text(TAGLINE))
			.nav(nav => nav
				.prepend(new Link("/").text("Portfolio"))));
	}

	public getTitle () {
		return Metadata.createTitle(this.metadata.title!, TITLE);
	}
}
