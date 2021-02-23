import Log from "../../shared/utilities/Log";
import Element from "./Element";
import Stylesheet from "./elements/Stylesheet";

export default class Page extends Element {

	public head = new Element("head")
		.appendTo(this);
	public body = new Element("body")
		.appendTo(this);

	protected appendsTo = this.body;
	private alreadyCompiled?: true;

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public async compile (indent?: boolean) {
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

		this.head.append(new Stylesheet(...stylesheets));

		return `<!DOCTYPE html>${indent ? "\n" : ""}${await super.compile(indent)}`;
	}
}
