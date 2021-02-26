import Element from "@element/Element";
import Heading from "@element/Heading";
import Link from "@element/Link";
import { createID, HrefFile } from "@util/Strings";

export default class Article extends Element {

	protected heading = new Heading(2)
		.appendTo(this);

	public constructor (title: string, link?: HrefFile) {
		super("article");
		const id = link === undefined ? createID(title) : undefined;
		new Link(link ?? `#${id!}` as const)
			.text(title)
			.appendTo(this.heading.id(id));
	}
}