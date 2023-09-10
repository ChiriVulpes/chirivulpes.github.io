import Article from "@element/Article";
import Element, { Heading } from "@element/Element";
import Link from "@element/Link";
import Nav from "@element/Nav";
import BlogPage from "@layout/BlogPage";
import Blog from "@page/blog/Blog";
import Page from "site/Page";
import Paginator from "site/Paginator";

/* eslint-disable */

let pages: Page[] = [];
export default new Page.Proxy(() => pages[0])
	.setAwait(Blog.INSTANCE.discovered.then(async () => pages = await [...Blog.INSTANCE.byTag.entries()]
		.sort(([, postsA], [, postsB]) => postsB.length - postsA.length)
		.map(async ([tag, posts]) => new Article("", `/blog/tag/${tag}`)
			.heading(heading => (heading.children[0] as Link)
				.dump()
				.append(new Element("strong")
					.text(`${posts.length}`))
				.text(` post${posts.length === 1 ? "" : "s"} tagged '`)
				.append(new Element("span")
					.class("tag")
					.text(tag))
				.text("'"))
			.append(...await Promise.all(posts.slice(0, 4)
				.map(post => post.createLink()))))
		.collect(Paginator.create)
		.setRoute("/blog/tags")
		.setTitle(page => ["Tags Archive", `Page ${page!}`])
		.generate((content, page) => new BlogPage()
			.main(main => main
				.append(new Element("header")
					.append(new Heading(2)
						.text("All Tags"))
					.append(new Nav()
						.append(new Element("span")
							.class("details")
							.text(`Page ${page}`))
						.link("Blog Archive", "/blog")))))
		?? []));
