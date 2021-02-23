import Element from "./Element";

export default class Page extends Element {

	public head = new Element("head")
		.appendTo(this);
	public body = new Element("body")
		.appendTo(this);

	protected appendsTo = this.body.children;

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public async compile (indent?: boolean) {
		return `<!DOCTYPE html>${indent ? "\n" : ""}${await super.compile(indent)}`;
	}
}
