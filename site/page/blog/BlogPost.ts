import Article from "@element/Article";
import Datetime from "@element/Date";
import Element, { MarkdownFragment, Text } from "@element/Element";
import Link from "@element/Link";
import BlogPage from "@layout/BlogPage";
import Blog from "@page/blog/Blog";
import Markdown from "@util/string/Markdown";
import { createID, HrefLocal } from "@util/string/Strings";
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
	private readonly preview: string;

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

		this.preview = Markdown.preview(markdown);
		this.metadata.setDescription(this.getTextPreview(256));

		this.metadata.title ??= path.basename(file);
		this.route = this.generateRoute();

		this._main
			.append(new Article(this.metadata.title)
				.class("blogpost")
				.append(new MarkdownFragment(markdown))
				.append(new Element("footer")
					.append(this.createPostDetails())))
			.append(new Paginator.Nav(Blog.INSTANCE.all, this, "/blog"));
	}

	private generateRoute (): HrefLocal {
		const date = this.metadata.publishedTime?.toISOString().split("T")[0] ?? "unknown";
		const title = createID(this.metadata.title!);
		return `/blog/${date}/${title}`;
	}

	private createPostDetails () {
		return new Element("p")
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
					.text(tag)));
	}

	public createArticle () {
		return new Article(this.metadata.title!, this.route)
			.class("blogpost", "preview")
			.setPublishedTime(this.metadata.publishedTime)
			.markdown(this.preview)
			.append(new Element("footer")
				.append(this.createPostDetails())
				.append(new Link(this.route!)
					.class("readmore")
					.text("Read More")
					.append(new Element("span")
						.setAriaHidden()
						.text(`of the article '${this.metadata.title!}'`))
					.setAriaLabel(`read more of the article '${this.metadata.title!}'`)));
	}

	public createLink () {
		return new Link(this.route!)
			.class("blog-smol", "paragraph-line-height")
			.append(new Datetime(this.metadata.publishedTime ?? new Date(0))
				.class("date"))
			.append(new Element("b")
				.text(this.metadata.title!))
			.text(" — ")
			.append(new Element("span")
				.text(this.getTextPreview(128)));
	}

	public getTextPreview (idealLength: number) {
		const description = this.preview
			.replace(/(?<=\n|^)#+\s+/g, "")
			.trim();
		return description.slice(0, description.indexOf(" ", idealLength - 3)) + "...";
	}
}
