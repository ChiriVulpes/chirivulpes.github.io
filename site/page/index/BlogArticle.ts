import Article from "@element/Article";
import Element from "@element/Element";
import Nav from "@element/Nav";
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
			.append(new Nav()
				.link(`See All ${Blog.INSTANCE.all.length} Posts`, "/blog")
				.link("Search Posts by Tag", "/blog/tags"))
			.appendTo(this);
	}
}
