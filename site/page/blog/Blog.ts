import BlogPost from "@page/blog/BlogPost";
import Files from "@util/Files";
import { Stopwatch } from "@util/Time";
import Site from "site/Site";

export default class Blog {

	public static INSTANCE = new Blog();

	static {
		void Blog.INSTANCE.discover();
	}

	private readonly _all: BlogPost[] = [];
	public get all () { return this._all as readonly BlogPost[]; }
	private readonly _byTag = new Map<string, BlogPost[]>();
	public get byTag () { return this._byTag as ReadonlyMap<string, readonly BlogPost[]>; }

	public async discover () {
		const markdownFiles = await Files.discoverFiles("site/collections/blog/**/*.md", "blog posts");
		const blogPosts: [file: string, blogPost: BlogPost, time: Stopwatch][] = [];
		for (const markdownFile of markdownFiles) {
			const result = await Files.load(markdownFile);
			if (!result)
				continue;

			const { value, time } = result;
			const blogPost = new BlogPost(markdownFile, value);

			// cache blog post into collections, sorted by date
			this.insertByDate(blogPost, this._all);
			for (const tag of blogPost.metadata.tags) {
				let tagged = this._byTag.get(tag);
				if (!tagged)
					this._byTag.set(tag, tagged = []);

				this.insertByDate(blogPost, tagged);
			}

			blogPosts.push([markdownFile, blogPost, time]);
		}

		for (const [markdownFile, blogPost, time] of blogPosts)
			await Site.add(markdownFile, blogPost, undefined, time);
	}

	private insertByDate (blogPost: BlogPost, into: BlogPost[]) {
		const newBlogPostTime = blogPost.metadata.publishedTime?.getTime() ?? 0;

		let i = 0;
		for (; i < into.length; i++)
			if (newBlogPostTime < (into[i].metadata.publishedTime?.getTime() ?? 0))
				break;

		into.splice(i, 0, blogPost);
	}

}
