import { IHasCard } from "@element/Article";
import Card from "@element/Card";
import Element from "@element/Element";
import Thumbnail from "@element/Thumbnail";
import Bound from "@util/decorator/Bound";
import Log from "@util/Log";
import { DateISO, HrefAbsolute } from "@util/Strings";
import ansi from "ansicolor";
import Site from "site/Site";

enum Status {
	Completed,
	Ongoing,
	Hiatus,
	Cancelled,
}

export type StoryStatus = keyof typeof Status;

enum ReleaseAfter {
	Edited,
	Rewritten,
	Completed,
	Soon,
	Later,
}

export type StoryReleaseAfter = keyof typeof ReleaseAfter;

enum Needs {
	Editing,
	Rewriting,
	Finishing,
}

export type StoryNeeds = keyof typeof Needs;

export interface StoryLength {
	words: number;
	chapters?: number;
}

const REG_ITCHIO = /^https:\/\/\w+\.itch\.io\//;

export default class Story implements IHasCard {

	public constructor (public title: string) {
	}

	////////////////////////////////////
	// Status
	//

	private _status?: StoryStatus;
	public get status (): StoryStatus {
		if (this._status !== undefined)
			return this._status;

		Log.error("Story", this.getID(), "missing status");
		return "Ongoing";
	}

	public setStatus (status: StoryStatus) {
		this._status = status;
		return this;
	}

	////////////////////////////////////
	// Synopsis
	//

	public synopsis?: string;
	public setSynopsis (synopsis: string) {
		this.synopsis = synopsis;
		return this;
	}

	////////////////////////////////////
	// Cover
	//

	public cover?: string;
	public setCover (cover: string) {
		this.cover = cover;
		return this;
	}

	////////////////////////////////////
	// Length
	//

	private _length?: StoryLength;
	public get length () {
		if (this._length !== undefined)
			return this._length;

		Log.error("Story", this.getID(), "missing length");
		return { words: 0 };
	}

	public setLength (words: number, chapters?: number) {
		this._length = { words, chapters };
		return this;
	}

	////////////////////////////////////
	// Link
	//

	private _link?: HrefAbsolute;
	public get link () {
		if (this._link !== undefined)
			return this._link;

		Log.error("Story", this.getID(), "missing link");
		return "/";
	}

	public setLink (link: HrefAbsolute) {
		this._link = link;
		return this;
	}

	////////////////////////////////////
	// Price
	//

	public price?: number;
	public currency?: string;
	public setPrice (price: number, currency?: string) {
		this.price = price;
		if (currency !== undefined)
			this.currency = currency;
		return this;
	}

	////////////////////////////////////
	// Published After
	//

	public publishedAfter?: StoryReleaseAfter[];
	public setPublishedAfter (...publishedAfter: StoryReleaseAfter[]) {
		this.publishedAfter = publishedAfter;
		return this;
	}

	////////////////////////////////////
	// Return After
	//

	public returnAfter?: StoryReleaseAfter[];
	public setReturnAfter (...returnAfter: StoryReleaseAfter[]) {
		this.returnAfter = returnAfter;
		return this;
	}

	////////////////////////////////////
	// Needs
	//

	public needs?: StoryNeeds[];
	public setNeeds (...needs: StoryNeeds[]) {
		this.needs = needs;
		return this;
	}

	////////////////////////////////////
	// Date
	//

	public date?: Date;
	public setDate (date: DateISO) {
		this.date = new Date(date);
		return this;
	}

	////////////////////////////////////
	// Order
	//

	public order?: number;
	public setOrder (order: number) {
		this.order = order;
		return this;
	}

	////////////////////////////////////
	// Card
	//

	public createCard () {
		return new Card(this.title, this.link)
			.class("story")
			.setImage(this.cover ? new Thumbnail(`cover/${this.cover}`, 200) : undefined)
			.details(this.createCardDetails)
			.markdown(this.synopsis);
	}

	public getOrder () {
		return [this.order ?? 0, this.date?.getTime() ?? 0];
	}

	@Bound private createCardDetails (details: Element) {
		const { chapters, words } = this.length;
		new Element("span")
			.class("length")
			.text((chapters === undefined ? "" : `${chapters === 1 ? "Oneshot" : `${chapters} chapters`}, `)
				+ `${Math.round(words / 1000)}k words.`)
			.appendTo(details);

		const status = this.status;
		if (status === "Hiatus") {
			const returnAfter = this.returnAfter;
			if (returnAfter === undefined)
				Log.warn("Story", this.getID(), "missing return time");
			else {
				let willReturn = " Will return ";

				let soon: keyof typeof ReleaseAfter | undefined = undefined;
				const after: (keyof typeof ReleaseAfter)[] = [];
				for (const time of returnAfter)
					if (time === "Later" || time === "Soon")
						soon = time;
					else
						after.push(time);

				if (soon !== undefined)
					willReturn += soon.toLowerCase();

				if (soon !== undefined && after !== undefined)
					willReturn += ", ";

				if (after !== undefined)
					willReturn += `after ${after.join(" and ").toLowerCase()}`;

				details.text(willReturn + ".");
			}
		}

		const location = this.getLocation();
		if (location !== undefined) {
			const price = this.price ?? 0;
			details.text(" Available for ")
				.append(new Element("span").class("price").text(price === 0 ? "free" : `${this.currency ?? "$"}${price}`))
				.text(` on ${location}.`);
		}

		const needs = this.needs;
		if (needs !== undefined)
			details.text(` Needs ${needs.join(", ").toLowerCase()}.`);
	}

	private getLocation () {
		const link = this.link;
		if (link.startsWith("https://www.scribblehub.com/"))
			return "Scribble Hub";

		if (link.startsWith("https://www.patreon.com/"))
			return "Patreon";

		if (link.startsWith(`https://${Site.host()!}/`))
			return "here";

		if (REG_ITCHIO.test(link))
			return "itch.io";

		return undefined;
	}

	private getID () {
		return ansi.red(this.title);
	}
}
