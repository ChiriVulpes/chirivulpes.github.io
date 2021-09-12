import Element, { Heading } from "@element/Element";
import Link from "@element/Link";
import Nav from "@element/Nav";
import BlogPage, { BLOG_TAGLINE, BLOG_TITLE } from "@layout/BlogPage";
import Blog from "@page/blog/Blog";
import Files from "@util/Files";
import Project from "site/collections/projects/Project";
import Page from "site/Page";
import Paginator from "site/Paginator";

let pages: Page[] = [];
export default new Page.Proxy(() => pages[0])
	.setAwait(Blog.INSTANCE.discovered.then(async () => {
		pages = await Blog.INSTANCE.all
			.map(blogPost => blogPost.createArticle())
			.collect(Paginator.create)
			.setRoute("/blog")
			.setTitle(page => page === undefined ? ["Archive", BLOG_TITLE]
				: page === 1 ? [BLOG_TITLE, BLOG_TAGLINE] : ["Archive", `Page ${page}`])
			.setRSS()
			.generate((content, page) => new BlogPage()
				.main(main => main
					.append(new Element("header")
						.append(new Heading(2)
							.text("Blog Archive"))
						.append(new Nav()
							.append(new Element("span")
								.class("details")
								.text(`Page ${page}`))
							.link("Search By Tag", "/blog/tags")))))
			?? [];

		const cardSources = (await Files.discoverClasses(Project, "site/collections"))
			.map(source => source.value);

		await [...Blog.INSTANCE.byTag.entries()]
			.map(([tag, blogPosts]) => blogPosts
				.map(blogPost => blogPost.createArticle())
				.collect(Paginator.create)
				.setRoute(`/blog/tag/${tag}`)
				.setTitle(page => [`Posts tagged '${tag}'`, ...page === undefined ? [] : [`Page ${page}`], BLOG_TITLE])
				.setRSS()
				.generate((content, page) => new BlogPage()
					.main(main => main
						.append(new Element("header")
							.append(new Heading(2)
								.append(new Element("span")
									.text("Posts tagged '")
									.append(new Element("span")
										.class("tag")
										.text(tag))
									.text("'"))
								.append(new Link(`/blog/tag/${tag}/rss.xml`)))
							.append(new Nav()
								.append(new Element("span")
									.class("details")
									.text(`Page ${page}`))
								.link("All Tags", "/blog/tags"))
							.append(...cardSources.filter(source => source.associatedTag === tag)
								.map(source => source.createCard()))))))
			.collect(promises => Promise.all(promises));
	}));
