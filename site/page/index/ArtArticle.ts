import Article from "@element/Article";
import Element, { Heading } from "@element/Element";
import Link from "@element/Link";
import Thumbnail from "@element/Thumbnail";
import StoriesArticle from "@page/index/StoriesArticle";
import Files from "@util/Files";
import Log from "@util/Log";
import { HrefAbsolute, HrefFile } from "@util/string/Strings";
import ansi from "ansicolor";
import path from "path";

interface IArtDetails {
	title?: string;
	link?: HrefAbsolute | "/";
	date?: Date;
	transparent?: true;
}

function details (date: Date, title?: string, link?: HrefAbsolute, transparent?: true): IArtDetails {
	return { title, link, date, transparent };
}

type ArtRecord = Record<string, IArtDetails | undefined>;

const storyDetails: ArtRecord = {
	"dissonant-1": details(new Date("april 2020"), "Dissonant (Cover 1)", "https://www.scribblehub.com/series/169785/dissonant/"),
	"dissonant-2": details(new Date("nov 23 2020"), "Dissonant (Cover 2)", "https://www.scribblehub.com/series/169785/dissonant/"),
	"earthborn-emissary": details(new Date("nov 20 2020"), "The Earthborn Emissary", "https://www.scribblehub.com/series/137161/the-earthborn-emissary/"),
	"hunted": details(new Date("nov 30 2020"), "Hunted", "https://www.scribblehub.com/series/203224/hunted/"),
	"leaking": details(new Date("april 15 2020"), "The Other World is Leaking!", "https://www.scribblehub.com/series/21898/the-other-world-is-leaking/"),
	"like-a-daydream": details(new Date("february 2020"), "Like a Daydream", "https://www.scribblehub.com/series/115399/like-a-daydream/"),
	"trolls-and-tribulations": details(new Date("jan 2021"), "Trolls and Tribulations", "https://rooibos-chai.itch.io/trolls-tribulations"),
	"unforeseen-variables": details(new Date("feb 2021"), "Unforeseen Variables", "https://www.scribblehub.com/series/240682/unforeseen-variables/"),
	"plushiemancer": details(new Date("june 2021"), "The Plushiemancer"),
	"heart-stops": details(new Date("may 2021"), "And If Your Heart Stops Beating", "https://www.scribblehub.com/series/225037/and-if-your-heart-stops-beating/"),
};

const artDetails: ArtRecord = {
	"chiri-peek": details(new Date("dec 2020"), undefined, undefined, true),
	"trolls-and-tribulations-fanart": details(new Date("jan 2021")),
};

export default new class ArtArticle extends Article {
	public constructor () {
		super("Art");
	}

	public async precompile () {
		const covers = await Files.discoverFiles("static/image/cover/**/*.png");
		if (covers.length > 0) {
			this.addSection("Story Covers", section => section
				.markdown("I make covers for stories — my own stories and others! I've gotten better at it, too, from what I think at least. The following covers are sorted from newest to oldest.")
				.append(...this.compileArt(covers, storyDetails, fileBase => StoriesArticle.cardSources.find(source => source.cover === fileBase))));
		}

		const art = await Files.discoverFiles("static/image/art/**/*.png");
		if (art.length > 0)
			this.addSection("Art", section => section
				.markdown("Years ago I used to make art all the time, but I was never super good at it so I kinda just fell out of the habit. Recently as I've gotten into making story covers I've started picking up art again, and I've been surprisingly happy with what I've managed to create!")
				.append(...this.compileArt(art, artDetails)));
	}

	private compileArt (pieces: string[], record: ArtRecord, resolver?: ArtResolver) {
		return pieces
			.map(url => {
				const details = getDetails(url, record, resolver);
				return [new Art("cover", url as HrefFile, details), details?.date?.getTime() ?? 0] as const;
			})
			.sort(([, dateA], [, dateB]) => dateB - dateA)
			.map(([art]) => art);
	}
}

type ArtResolver = (baseFile: string, url: string) => IArtDetails | undefined;

function getDetails (file: string, record: ArtRecord, resolver?: ArtResolver): IArtDetails {
	const fileBase = path.basename(file, ".png");
	const match = record[fileBase]
		?? resolver?.(fileBase, file);

	if (match !== undefined)
		return match;

	Log.warn("Story cover", ansi.red(fileBase), "has no details");
	return {};
}

class Art extends Element {
	public constructor (type: "cover" | "art", file: HrefFile, details: IArtDetails) {
		super();
		this.class("art");
		new Thumbnail(file, 200)
			.class(...details.transparent ? ["borderless"] : [])
			.appendTo(new Link(file)
				.appendTo(this));

		if (!details.title)
			return;

		new Heading(5)
			.append((details.link ? new Link(details.link) : new Element()).text(details.title))
			.appendTo(this);
	}
}
