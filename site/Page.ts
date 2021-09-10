import Element from "@element/Element";
import Meta from "@element/Meta";
import Script from "@element/Script";
import Stylesheet from "@element/Stylesheet";
import Log from "@util/Log";
import { DateISO, HrefAbsolute, HrefLocal } from "@util/Strings";

export class Metadata<HOST extends Page> {

	public static createTitle (...title: string[]) {
		return title.join(" &nbsp;| &nbsp;");
	}

	public constructor (private readonly host: HOST) { }

	public title?: string;
	public setTitle (...title: string[]) {
		this.title = Metadata.createTitle(...title);
		return this.host;
	}

	public description?: string;
	public setDescription (description: string) {
		this.description = description;
		return this.host;
	}

	public image?: HrefAbsolute;
	public setImage (url: HrefAbsolute) {
		this.image = url;
		return this.host;
	}

	public url?: HrefAbsolute;
	public setURL (url: HrefAbsolute) {
		this.url = url;
		return this.host;
	}

	////////////////////////////////////
	// Articles
	//

	public author?: string;
	public setAuthor (author: string) {
		this.author = author;
		return this.host;
	}

	public tags = new Set<string>();
	public addTags (...tags: string[]) {
		for (const tag of tags)
			this.tags.add(tag);
		return this.host;
	}

	public publishedTime?: Date;
	public setPublishedTime (time: Date) {
		this.publishedTime = time;
		return this.host;
	}
}

class Page extends Element {

	protected head = new Element("head")
		.appendTo(this);
	protected body = new Element("body")
		.appendTo(this);

	protected appendsTo = this.body;
	public log = Log.new();
	public metadata = new Metadata(this);

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public route?: HrefLocal;
	public setRoute (route: HrefLocal) {
		this.route = route;
		return this;
	}

	private pageType: Meta.OpenGraphType = "website";
	public setPageType (type: Meta.OpenGraphType) {
		this.pageType = type;
		return this;
	}

	protected async precompile (indent: boolean) {
		////////////////////////////////////
		// Descendant pre-compilation
		//

		await this.precompileDescendants(indent);

		////////////////////////////////////
		// Misc
		//

		new Meta.Viewport("width=device-width", "initial-scale=1")
			.appendTo(this.head);

		////////////////////////////////////
		// Metadata
		//

		const title = this.getTitle();
		if (title)
			new Element("title")
				.text(title)
				.appendTo(this.head);
		else
			this.log.warn("Missing title");

		const description = this.metadata.description;
		if (description)
			new Meta.Description(description)
				.appendTo(this.head);

		new Meta.OpenGraph("type", this.pageType)
			.appendTo(this.head);

		if (title)
			new Meta.OpenGraph("title", title)
				.appendTo(this.head);

		if (description)
			new Meta.OpenGraph("description", description)
				.appendTo(this.head);

		const url = this.metadata.url;
		if (url)
			new Meta.OpenGraph("url", url)
				.appendTo(this.head);

		const image = this.metadata.image;
		if (image)
			new Meta.OpenGraph("image", image)
				.appendTo(this.head);

		if (this.pageType === "article") {
			const author = this.metadata.author;
			if (author)
				new Meta.OpenGraph("article:author", author)
					.appendTo(this.head);

			const published = this.metadata.publishedTime;
			if (published)
				new Meta.OpenGraph("article:published_time", published.toISOString() as DateISO)
					.appendTo(this.head);

			const tags = this.metadata.tags;
			if (tags.size > 0)
				new Meta.OpenGraph("article:tag", ...tags)
					.appendTo(this.head);
		}

		////////////////////////////////////
		// Stylesheets
		//

		const stylesheets = new Set<string>();

		const elementsWithStylesheets = this.findAllElements(descendant => descendant.requiredStylesheets?.length);
		if (this.requiredStylesheets !== undefined)
			elementsWithStylesheets.unshift(this);
		for (const elementWithStylesheets of elementsWithStylesheets)
			for (const stylesheet of elementWithStylesheets.requiredStylesheets!)
				stylesheets.add(stylesheet);

		new Stylesheet(...stylesheets)
			.appendTo(this.head);

		////////////////////////////////////
		// Scripts
		//

		const scripts = new Set<string>();

		const elementsWithScripts = this.findAllElements(descendant => descendant.requiredScripts?.length);
		if (this.requiredScripts !== undefined)
			elementsWithScripts.unshift(this);
		for (const elementWithScripts of elementsWithScripts)
			for (const script of elementWithScripts.requiredScripts!)
				scripts.add(script);

		new Script(...scripts)
			.appendTo(this.body);
	}

	protected getTitle () {
		return this.metadata.title;
	}

	protected async compile (indent: boolean) {
		return `<!DOCTYPE html>${indent ? "\n" : ""}${await super.compile(indent)}`
			.replace(/(<pre(?:\s.*?)?>)(.*)<\/pre>/gs, (match, startTag: string, contents: string) => {
				let minIndent = Infinity;
				let indent = Infinity;
				for (let i = 0; i < contents.length; i++) {
					const char = contents[i];

					if (char === "\n" || char === "\r")
						indent = 0;
					else if (char === "\t" && indent >= 0)
						indent++;
					else {
						minIndent = Math.min(indent, minIndent);
						indent = Infinity;
					}
				}

				return `${startTag}${contents.unindent(minIndent)}</pre>`;
			});
	}
}

namespace Page {
	export class Proxy<P extends Page = Page> {
		public constructor (public readonly supplier: () => P) { }

		public route?: HrefLocal;
		public setRoute (route: HrefLocal) {
			this.route = route;
			return this;
		}

		public promise?: Promise<any>;
		public setAwait (promise: Promise<any>) {
			this.promise = promise;
			return this;
		}
	}
}

export default Page;
