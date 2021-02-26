import Element, { Fragment } from "@element/Element";
import Link from "@element/Link";
import Masonry from "@element/Masonry";
import DefaultPage from "@layout/DefaultPage";
import ArtArticle from "site/page/index/ArtArticle";
import BlogArticle from "site/page/index/BlogArticle";
import MusicArticle from "site/page/index/MusicArticle";
import ProgrammingArticle from "site/page/index/ProgrammingArticle";
import StoriesArticle from "site/page/index/StoriesArticle";

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
			.append(new Element("p")
				.text("Thanks for checking out my work!"))
			.append(new Element("p")
				.text("If you'd like to commission story chapters, consider checking out my ")
				.append(new Link("https://www.patreon.com/chirichirichiri").text("Patreon"))
				.text("."))
			.append(new Element("p")
				.text("If you'd like to commission a story cover, stay tuned. I'll find some way to sell commissions for these soon!"))
			.append(new Element("p")
				.text("Just wanna talk? Join my ")
				.append(new Link("https://discord.gg/XPPvW9F").text("Discord"))
				.text("!"))));
