import Element, { HTML } from "@element/Element";
import Link from "@element/Link";
import DefaultPage from "@layout/DefaultPage";
import fs from "fs-extra";

const TITLE = "Chiri's Blog";
const TAGLINE = "Where a fox goes to ramble!";

export default new DefaultPage()
	.metadata.setTitle(`${TITLE} &nbsp;| &nbsp;${TAGLINE}`)
	.metadata.setDescription(TAGLINE)
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
			.text(TAGLINE))
		.nav(nav => nav
			.prepend(new Link("/").text("Portfolio"))))
	.main(main => main
		.markdown(fs.readFileSync("site/collections/blog/2021-01-26-wayward-dev-inspection-system.md", "utf8")));
