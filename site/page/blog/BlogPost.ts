import Article from "@element/Article";
import Datetime from "@element/Date";
import Element, { Markdown, Text } from "@element/Element";
import Link from "@element/Link";
import BlogPage from "@layout/BlogPage";
import Blog from "@page/blog/Blog";
import { createID } from "@util/Strings";
import yaml from "js-yaml";
import path from "path";
import Paginator from "site/Paginator";

const FRONTMATTER_DELIMITER = "---";

interface IBlogPostMetadata {
	date?: Date;
	title?: string;
	tags?: string | string[];
}

export default class BlogPost extends BlogPage {

	public readonly tags: string[] = [];

	public constructor (public readonly file: string, markdown: string) {
		super();

		let i = 0;
		if (markdown.startsWith(FRONTMATTER_DELIMITER)) {
			let frontmatter = "";
			for (; i < markdown.length; i++) {
				if (markdown[i] === "\n" && markdown.substringAt(FRONTMATTER_DELIMITER, i + 1))
					break;

				frontmatter += markdown[i];
			}

			// slice off the frontmatter
			markdown = markdown.slice(i + 4);
			const metadata = yaml.load(frontmatter, { filename: file }) as IBlogPostMetadata;
			this.metadata.title = metadata.title;
			this.metadata.publishedTime = metadata.date;
			for (const tag of typeof metadata.tags === "string" ? metadata.tags.split(/,\s+/g) : metadata.tags ?? [])
				this.metadata.tags.add(tag);
		}

		this.metadata.title ??= path.basename(file);
		this.generateRoute();

		this._main.append(new Article(this.metadata.title)
			.append(new Markdown(markdown))
			.append(new Element("footer")
				.append(new Element("p")
					.class("details")
					.text("Posted ")
					.append(new Element("span")
						.class("date")
						.append(this.metadata.publishedTime ? new Datetime(this.metadata.publishedTime)
							: new Text("an unknown time ago")))
					.append(new Element("br"))
					.text("Tagged as ")
					.append(...[...this.metadata.tags]
						.map(tag => new Link(`/blog/tag/${tag}`)
							.class("tag")
							.setSimple()
							.text(tag))))))
			.append(new Paginator.Nav(Blog.INSTANCE.all, this, "/blog"));
	}

	private generateRoute () {
		if (!this.metadata.publishedTime)
			return;

		const date = this.metadata.publishedTime.toISOString().split("T")[0];
		const title = createID(this.metadata.title!);
		this.route = `/blog/${date}/${title}`;
	}

	public createArticle () {
		return new Article(this.metadata.title!, this.route);
	}
}
