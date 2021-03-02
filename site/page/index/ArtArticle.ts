import Article from "@element/Article";
import Element from "@element/Element";
import Heading from "@element/Heading";
import Link from "@element/Link";
import Thumbnail from "@element/Thumbnail";
import StoriesArticle from "@page/index/StoriesArticle";
import Files from "@util/Files";
import Log from "@util/Log";
import { HrefAbsolute, HrefFile } from "@util/Strings";
import ansi from "ansicolor";
import path from "path";

export default new class ArtArticle extends Article {
	public constructor () {
		super("Art");
	}

	public async precompile () {
		const covers = await Files.discoverFiles("static/image/cover/**/*.png");
		if (covers.length > 0) {
			this.addSection("Story Covers", section => section
				.markdown("I make covers for stories — my own stories and others! I've gotten better at it, too, from what I think at least. The following covers are sorted from newest to oldest.")
				.append(...covers
					.map(cover => {
						const details = getCoverDetails(cover);
						return [new Art("cover", cover as HrefFile, details!), details?.date?.getTime() ?? 0] as const;
					})
					.sort(([, dateA], [, dateB]) => dateB - dateA)
					.map(([art]) => art)));
		}

		const art = await Files.discoverFiles("static/image/art/**/*.png");
		if (art.length > 0)
			this.addSection("Art", section => section
				.markdown("Years ago I used to make art all the time, but I was never super good at it so I kinda just fell out of the habit. Recently as I've gotten into making story covers I've started picking up art again, and I've been surprisingly happy with what I've managed to create!")
				.append(...art.map(piece => new Art("art", piece as HrefFile))));
	}
}

function getCoverDetails (file: string) {
	const fileBase = path.basename(file, ".png");
	const matchingStory = storyDetails[fileBase]
		?? StoriesArticle.cardSources.find(source => source.cover === fileBase);

	if (matchingStory !== undefined)
		return matchingStory;

	Log.warn("Story cover", ansi.red(fileBase), "has no details");
}

interface IStoryDetails {
	title: string;
	link: HrefAbsolute;
	date?: Date;
}

function story (title: string, link: HrefAbsolute, date: Date): IStoryDetails {
	return { title, link, date };
}

const storyDetails: Record<string, IStoryDetails> = {
	"dissonant-1": story("Dissonant (Cover 1)", "https://www.scribblehub.com/series/169785/dissonant/", new Date("april 2020")),
	"dissonant-2": story("Dissonant (Cover 2)", "https://www.scribblehub.com/series/169785/dissonant/", new Date("nov 23 2020")),
	"earthborn-emissary": story("The Earthborn Emissary", "https://www.scribblehub.com/series/137161/the-earthborn-emissary/", new Date("nov 20 2020")),
	"hunted": story("Hunted", "https://www.scribblehub.com/series/203224/hunted/", new Date("nov 30 2020")),
	"leaking": story("The Other World is Leaking!", "https://www.scribblehub.com/series/21898/the-other-world-is-leaking/", new Date("april 15 2020")),
	"like-a-daydream": story("Like a Daydream", "https://www.scribblehub.com/series/115399/like-a-daydream/", new Date("february 2020")),
	"trolls-and-tribulations": story("Trolls and Tribulations", "https://rooibos-chai.itch.io/trolls-tribulations", new Date("jan 2021")),
	"unforeseen-variables": story("Unforeseen Variables", "https://www.scribblehub.com/series/240682/unforeseen-variables/", new Date("feb 2021")),
};

class Art extends Element {
	public constructor (type: "art", file: HrefFile);
	public constructor (type: "cover", file: HrefFile, details: IStoryDetails);
	public constructor (type: "cover" | "art", file: HrefFile, details?: IStoryDetails) {
		super();
		this.class("art");
		new Thumbnail(file, 200)
			.appendTo(new Link(file)
				.appendTo(this));

		if (type !== "cover" || details === undefined)
			return;

		new Heading(4)
			.append(new Link(details.link)
				.text(details.title))
			.appendTo(this);
	}
}
