import Element from "@element/Element";
import BaseNav from "@element/Nav";
import DefaultPage from "@layout/DefaultPage";
import Files from "@util/Files";
import Log from "@util/Log";
import { HrefLocal } from "@util/Strings";
import Page from "site/Page";
import Site from "site/Site";
import trace from "stack-trace";

class Paginator<E extends Element> {

	public static create<E extends Element> (content: readonly E[]) {
		return new Paginator(content);
	}

	public constructor (private readonly content: readonly E[]) {
	}

	private pageSize = 5;
	public setPageSize (size: number) {
		this.pageSize = Math.max(1, size);
		return this;
	}

	private route?: HrefLocal;
	public setRoute (route: HrefLocal) {
		this.route = route;
		return this;
	}

	private title?: (index: number) => string[] | undefined;
	public setTitle (titleSupplier: (index: number) => string[] | undefined) {
		this.title = titleSupplier;
		return this;
	}

	public async generate (generator: (content: E[]) => DefaultPage) {
		if (!this.route) {
			Log.error(`Ignoring paginator generated by ${Files.loggify(trace.get()[1].getFileName())}, no base route provided`);
			return;
		}

		let cursor = 0;
		let content: E[];
		const pages: Page[] = [];
		while ((content = this.content.slice(cursor, cursor += this.pageSize)).length) {
			const page = generator(content);
			const pageIndex = cursor / this.pageSize;

			const title = this.title?.(pageIndex);
			if (title)
				page.metadata.setTitle(...title);

			pages.push(page
				.main(main => main
					.append(...content)
					.append(new Paginator.Nav(pages, page)
						.setUsePageNumbers()))
				.setRoute(`${this.route}${pageIndex <= 1 ? "" : `/${pageIndex}`}`));
		}

		for (const page of pages)
			await Site.add(page);

		return pages;
	}
}

namespace Paginator {

	export class Nav<P extends Page> extends BaseNav {

		public constructor (private readonly over: readonly P[], private readonly current: P, private readonly paginationIndex?: HrefLocal) {
			super();
			this.class("paginator");
		}

		private usePageNumbers = false;
		public setUsePageNumbers () {
			this.usePageNumbers = true;
			return this;
		}

		public precompile () {
			const index = this.over.indexOf(this.current);
			if (index > 0) {
				const prev = this.over[index - 1];
				const title = this.usePageNumbers ? `Page ${index}`
					: prev.metadata.title ?? "Previous";
				const linkText = new Element("span")
					.text(`${title} &nbsp;`)
					.append(new Element("span")
						.class("details")
						.text("Previous"));
				this.link(linkText, prev.route ?? "/", link => link
					.class("paginator-prev"));
			}

			if (this.paginationIndex)
				this.link("All", this.paginationIndex, link => link
					.class("paginator-index"));

			if (index < this.over.length - 1) {
				const next = this.over[index + 1];
				const title = this.usePageNumbers ? `Page ${index + 2}`
					: next.metadata.title ?? "Next";
				const linkText = new Element("span")
					.text(`&nbsp; ${title}`)
					.prepend(new Element("span")
						.class("details")
						.text("Next"));
				this.link(linkText, next.route ?? "/", link => link
					.class("paginator-next"));
			}

			if (!this.children.length) {
				this.type = "footer";
				this.classes.delete("paginator");
				this.append(new Element("p")
					.class("eoc")
					.text("You've reached the end of the content! Such a travesty..."));
			}
		}
	}
}

export default Paginator;
