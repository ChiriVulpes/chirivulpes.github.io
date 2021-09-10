import Article from "@element/Article";
import Datetime from "@element/Date";
import Element from "@element/Element";
import Link from "@element/Link";
import Blog from "@page/blog/Blog";

export default new class extends Article {

	public constructor () {
		super("Blog", "/blog");
		this.id("blog");
	}

	protected async precompile () {
		await Blog.INSTANCE.discovered;
		const articles = Math.min(Blog.INSTANCE.all.length, 4);
		for (let i = 0; i < articles; i++) {
			const blogPost = Blog.INSTANCE.all[i];
			new Link(blogPost.route!)
				.class("blog-smol", "paragraph-line-height")
				.append(new Datetime(blogPost.metadata.publishedTime ?? new Date(0))
					.class("date"))
				.append(new Element("b").text(blogPost.metadata.title!))
				.text(" — ")
				.append(new Element("span").text(blogPost.getTextPreview(128)))
				.appendTo(this);
		}

		if (articles < Blog.INSTANCE.all.length)
			new Element("footer")
				.append(new Element())
				.append(new Link("/blog")
					.text(`See All ${Blog.INSTANCE.all.length} Posts`))
				.appendTo(this);
	}
}
