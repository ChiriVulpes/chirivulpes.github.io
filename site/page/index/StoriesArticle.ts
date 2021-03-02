import Article from "@element/Article";
import Story from "site/collections/stories/Story";

export default new Article<Story>("Stories")
	.header(header => header
		.setNav(nav => nav
			.link("Patreon")
			.link("itch.io")
			.link("Scribble Hub"))
		.markdown(`
			I write transgender-themed novels! I work in all sorts of genres from realistic fiction to fantasy to sci-fi and more. If you're trans or you like to read stories about people coming to understand aspects of themselves, and getting happier all the while, consider checking them out!

			**I take commissions!** If you'd like to commission a chapter, check out my [Patreon].`))
	.setContainsCards(Story, "site/collections/stories", "status");
