import Element from "./Element";

export default class Page extends Element {

	public head = new Element("head")
		.appendTo(this);
	public body = new Element("head")
		.appendTo(this);

	protected appendsTo = this.body.children;

	public constructor () {
		super("html");
		this.attribute("lang", "en");
	}

	public compile (indent?: boolean) {
		return `<!DOCTYPE html>${indent ? "\n" : ""}${super.compile(indent)}`;
	}
}
