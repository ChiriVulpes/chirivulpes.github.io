import Log from "../../shared/utilities/Log";
import Element from "./Element";
import Meta from "./elements/Meta";
import Stylesheet from "./elements/Stylesheet";
import { DateISO, HrefAbsolute } from "./Strings";

export class Metadata<HOST extends Page> {

	public constructor (private readonly host: HOST) { }

	public title?: string;
	public setTitle (title: string) {
		this.title = title;
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

export default class Page extends Element {

	protected head = new Element("head")
		.appendTo(this);
	protected body = new Element("body")
		.appendTo(this);

	protected appendsTo = this.body;
	private alreadyCompiled?: true;
	public log = Log.new();
	public metadata = new Metadata(this);

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	private pageType: Meta.OpenGraphType = "website";
	public setPageType (type: Meta.OpenGraphType) {
		this.pageType = type;
		return this;
	}

	public async precompile (indent: boolean) {
		if (this.alreadyCompiled === true) {
			Log.error("Tried to recompile a page. Pages can only be compiled once.");
			return "";
		}

		////////////////////////////////////
		// Stylesheets
		//

		const stylesheets = new Set<string>();

		const elementsWithStylesheets = this.findAllElements(descendant => descendant.requiredStylesheets?.length);
		if (this.requiredStylesheets !== undefined)
			elementsWithStylesheets.push(this);
		for (const elementWithStylesheets of elementsWithStylesheets)
			for (const stylesheet of elementWithStylesheets.requiredStylesheets!)
				stylesheets.add(stylesheet);

		new Stylesheet(...stylesheets)
			.appendTo(this.head);

		////////////////////////////////////
		// Descendant pre-compilation
		//

		for (const elementNeedingPrecompilation of this.findAllElements(descendant => descendant.precompile !== undefined))
			await elementNeedingPrecompilation.precompile!(indent);

		////////////////////////////////////
		// Misc
		//

		new Meta.Viewport("width=device-width", "initial-scale=1")
			.appendTo(this.head);

		////////////////////////////////////
		// Metadata
		//

		const title = this.metadata.title;
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
	}

	public async compile (indent: boolean) {
		if (this.alreadyCompiled === true) {
			Log.error("Tried to recompile a page. Pages can only be compiled once.");
			return "";
		}

		this.alreadyCompiled = true;
		return `<!DOCTYPE html>${indent ? "\n" : ""}${await super.compile(indent)}`;
	}
}
