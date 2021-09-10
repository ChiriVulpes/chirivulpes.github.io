import Element, { Heading } from "@element/Element";
import Link from "@element/Link";
import BlogPage, { BLOG_TAGLINE, BLOG_TITLE } from "@layout/BlogPage";
import Blog from "@page/blog/Blog";
import Page from "site/Page";
import Paginator from "site/Paginator";

let pages: Page[] = [];
export default new Page.Proxy(() => pages[0])
	.setAwait(Blog.INSTANCE.discovered.then(async () => {
		pages = await Blog.INSTANCE.all
			.map(blogPost => blogPost.createArticle())
			.collect(Paginator.create)
			.setRoute("/blog")
			.setTitle(page => page === 1 ? [BLOG_TITLE, BLOG_TAGLINE] : ["Archive", `Page ${page}`])
			.generate((content, page) => new BlogPage()
				.main(main => main
					.append(new Element("header")
						.append(new Heading(2)
							.text(`Blog Archive: Page ${page}`))
						.append(new Link("/blog/tags")
							.text("Search By Tag")))))
			?? [];

		await [...Blog.INSTANCE.byTag.entries()]
			.map(([tag, blogPosts]) => blogPosts
				.map(blogPost => blogPost.createArticle())
				.collect(Paginator.create)
				.setRoute(`/blog/tag/${tag}`)
				.setTitle(page => [`Posts tagged '${tag}'`, `Page ${page}`])
				.generate((content, page) => new BlogPage()
					.main(main => main
						.append(new Element("header")
							.append(new Heading(2)
								.text("Posts tagged '")
								.append(new Element("span")
									.class("tag")
									.text(tag))
								.text(`': Page ${page}`))
							.append(new Link("/blog/tags")
								.text("All Tags"))))))
			.collect(promises => Promise.all(promises));
	}));
