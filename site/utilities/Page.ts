import Element from "./Element";
import Stylesheet from "./elements/Stylesheet";

export default class Page extends Element {

	public head = new Element("head")
		.appendTo(this);
	public body = new Element("body")
		.appendTo(this);

	protected appendsTo = this.body;

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public async compile (indent?: boolean) {
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
