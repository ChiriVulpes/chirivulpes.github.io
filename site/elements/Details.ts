import Element, { Initialiser } from "@element/Element";

export default class Details extends Element {
	public constructor (summaryInitialiser: Initialiser<Element>) {
		super("details");
		this.append(new Element("summary")
			.init(summaryInitialiser));
	}
}
