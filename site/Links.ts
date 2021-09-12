import Markdown from "@util/string/Markdown";

enum Links {
	"GitHub" = "https://github.com/ChiriVulpes",
	"Twitter" = "https://twitter.com/ChiriVulpes",
	"Discord" = "https://discord.gg/XPPvW9F",
	"Scribble Hub" = "https://www.scribblehub.com/profile/12063/chirivulpes/",
	"itch.io" = "https://chirivulpes.itch.io/",
	"Patreon" = "https://www.patreon.com/chirivulpes",
	"YouTube" = "https://www.youtube.com/channel/UCePEUnShLHdvPfsjkEH5dDA",
	"Twitch" = "https://www.twitch.tv/chirivulpes",
	"SoundCloud" = "https://soundcloud.com/chirivulpes",
	"Bandcamp" = "https://chirivulpes.bandcamp.com/",
}

export default Links;

Markdown.registerFilter({
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
