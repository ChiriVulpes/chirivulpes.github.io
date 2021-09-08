import Element, { HTML } from "@element/Element";
import Link from "@element/Link";
import DefaultPage from "@layout/DefaultPage";

const TITLE = "Chiri's Blog";

export default new DefaultPage()
	.requireStyles("page/blog")
	.header(header => header
		.homeLink(homeLink => homeLink
			.dump()
			.append(new Element().text(TITLE))
			.append(new Element()
				.append(new Element("span").setAriaHidden().text(TITLE))
				.append(new Link("/rss/blog.xml")
					.setAriaLabel("RSS Feed")
					.class("rss-link")
					.append(HTML.fromFile("/static/image/rss.svg")))))
		.tagline(tagline => tagline
			.text("Where a fox goes to ramble!"))
		.nav(nav => nav
			.prepend(new Link("/").text("Portfolio"))))
	.main(main => main);
