import Article from "@element/Article";
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
		for (let i = 0; i < articles; i++)
			Blog.INSTANCE.all[i]
				.createLink()
				.appendTo(this);

		new Element("footer")
			.append(new Element())
			.append(new Element()
				.append(new Link("/blog")
					.text(`See All ${Blog.INSTANCE.all.length} Posts`))
				.append(new Link("/blog/tags")
					.text("Search Posts by Tag")))
			.appendTo(this);
	}
}
