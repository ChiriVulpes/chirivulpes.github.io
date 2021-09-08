import { IMarkdownFilter } from "@util/Strings";

enum Links {
	"GitHub" = "https://github.com/ChiriCuddles",
	"Twitter" = "https://twitter.com/ChiriMystere",
	"Discord" = "https://discord.gg/XPPvW9F",
	"Scribble Hub" = "https://www.scribblehub.com/profile/12063/chirichirichiri/",
	"itch.io" = "https://chirichirichiri.itch.io/",
	"Patreon" = "https://www.patreon.com/chirichirichiri",
	"YouTube" = "https://www.youtube.com/channel/UCePEUnShLHdvPfsjkEH5dDA",
	"Twitch" = "https://www.twitch.tv/chirichirichiri",
	"SoundCloud" = "https://soundcloud.com/chirichirichiri",
	"Bandcamp" = "https://chirichirichiri.bandcamp.com/",
}

export default Links;

IMarkdownFilter.register({
	start: "[",
	replace (markdown, i) {
		let linkText = "";
		for (; i < markdown.length; i++) {
			const char = markdown[i];
			if (char === "]")
				break;

			linkText += char;
		}

		const link = Links[linkText as keyof typeof Links];
		if (link !== undefined && markdown[i + 1] !== "(")
			return { insert: `[${linkText}](${link})`, cursor: i };
	},
})
