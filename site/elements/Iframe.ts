import Element from "@element/Element";
import { HrefFile } from "@util/Strings";

export default class Iframe extends Element {

	private notLazy?: true;

	public constructor (src: HrefFile) {
		super("iframe");
		this.attribute("src", src);
	}

	public setTitle (title: string) {
		this.attribute("title", title);
		return this;
	}

	public setHeight (height: number) {
		this.attribute("height", `${height}`);
		return this;
	}

	public setNotLazy () {
		this.notLazy = true;
		return this;
	}

	public precompile () {
		if (!this.notLazy)
			this.attribute("loading", "lazy");
	}
}
