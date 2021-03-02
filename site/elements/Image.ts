import Element from "@element/Element";
import { HrefFile } from "@util/Strings";

export default class Image extends Element {
	public constructor (src: HrefFile) {
		super("img");
		this.attribute("src", src);
		this.attribute("loading", "lazy");
	}
}