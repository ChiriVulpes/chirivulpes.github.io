import Element, { Fragment } from "@element/Element";
import Link from "@element/Link";
import Masonry from "@element/Masonry";
import DefaultPage from "@layout/DefaultPage";
import ArtArticle from "@page/index/ArtArticle";
import BlogArticle from "@page/index/BlogArticle";
import MusicArticle from "@page/index/MusicArticle";
import ProgrammingArticle from "@page/index/ProgrammingArticle";
import StoriesArticle from "@page/index/StoriesArticle";

export default new DefaultPage()
	.requireStyles("page/home")
	.header(header => header
		.homeLink(homeLink => homeLink
			.dump()
			.text("Chiri")
			.append(new Element("span").class("names")
				.append(new Element("span").text("&nbsp;Vulpes"))
				.append(new Element("span").text("chirichiri").setAriaHidden())
				.append(new Element("span").text("&nbsp;Mystere").setAriaHidden())
				.append(new Element("span").text("Cuddles").setAriaHidden())))
		.nav(nav => nav
			.prepend(new Link("/blog").text("Blog"))))
	.main(main => main
		.append(new Masonry()
			.column(column => column
				.setFractionWidth(3)
				.append(StoriesArticle, ArtArticle))
			.column(column => column
				.setFractionWidth(2)
				.append(BlogArticle, ProgrammingArticle, MusicArticle))))
	.footer(footer => footer
		.prepend(new Fragment()
			.markdown(`
				Thanks for checking out my work!

				If you'd like to commission story chapters, consider checking out my [Patreon].

				If you'd like to commission a story cover, stay tuned. I'll find some way to sell commissions for these soon!

				Just wanna talk? Join my [Discord]!`)));
