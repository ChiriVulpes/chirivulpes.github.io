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
			.generate(() => new BlogPage())
			?? [];

		await [...Blog.INSTANCE.byTag.entries()]
			.map(([tag, blogPosts]) => blogPosts
				.map(blogPost => blogPost.createArticle())
				.collect(Paginator.create)
				.setRoute(`/blog/tag/${tag}`)
				.generate(() => new BlogPage()))
			.collect(promises => Promise.all(promises));
	}));
