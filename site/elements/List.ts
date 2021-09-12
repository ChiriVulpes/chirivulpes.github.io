import Element, { Initialiser } from "@element/Element";

export default class List extends Element {

	public constructor (type: "ul" | "ol" = "ul") {
		super(type);
	}

	public add (initialiser: Initialiser<Element>) {
		return this.append(new Element("li")
			.init(initialiser));
	}
}
