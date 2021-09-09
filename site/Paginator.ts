import Element from "@element/Element";
import Nav from "@element/Nav";
import { HrefLocal } from "@util/Strings";
import Page from "site/Page";

export default class Paginator<P extends Page> extends Nav {

	public constructor (private readonly over: readonly P[], private readonly current: P, private readonly paginationIndex: HrefLocal) {
		super();
		this.class("paginator");
	}

	public precompile () {
		const index = this.over.indexOf(this.current);
		console.log(this.over, index)
		if (index > 0) {
			const prev = this.over[index - 1];
			this.link(`${prev.metadata.title ?? "Previous"} &nbsp;`, prev.route ?? "/", link => link
				.class("paginator-prev")
				.append(new Element("span")
					.class("details")
					.text("Previous")));
		}

		this.link("All", this.paginationIndex, link => link
			.class("paginator-index"));

		if (index < this.over.length - 1) {
			const next = this.over[index + 1];
			this.link(`${next.metadata.title ?? "Next"} &nbsp;`, next.route ?? "/", link => link
				.class("paginator-next")
				.append(new Element("span")
					.class("details")
					.text("Next")));
		}
	}
}
