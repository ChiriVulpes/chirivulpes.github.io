import Log from "../../shared/utilities/Log";
import Element from "./Element";
import Stylesheet from "./elements/Stylesheet";

export default class Page extends Element {

	public head = new Element("head")
		.appendTo(this);
	public body = new Element("body")
		.appendTo(this);

	public title = new Element("title")
		.setTextRequired()
		.appendTo(this.head);

	protected appendsTo = this.body;
	private alreadyCompiled?: true;
	public log = Log.new();

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public setTitle (title: string) {
		this.title.text(title);
		return this;
	}

	public async precompile (indent: boolean) {
		if (this.alreadyCompiled === true) {
			Log.error("Tried to recompile a page. Pages can only be compiled once.");
			return "";
		}

		const stylesheets = new Set<string>();

		const elementsWithStylesheets = this.findAllElements(descendant => descendant.requiredStylesheets?.length);
		if (this.requiredStylesheets !== undefined)
			elementsWithStylesheets.push(this);
		for (const elementWithStylesheets of elementsWithStylesheets)
			for (const stylesheet of elementWithStylesheets.requiredStylesheets!)
				stylesheets.add(stylesheet);

		new Stylesheet(...stylesheets)
			.appendTo(this.head);

		for (const elementNeedingPrecompilation of this.findAllElements(descendant => descendant.precompile !== undefined))
			await elementNeedingPrecompilation.precompile!(indent);
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
