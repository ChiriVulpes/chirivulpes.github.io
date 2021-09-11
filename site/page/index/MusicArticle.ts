import Article from "@element/Article";
import Element from "@element/Element";
import Iframe from "@element/Iframe";

class Soundcloud extends Element {
	public constructor (track: string, title: string) {
		super();
		this.class("soundcloud");
		this.append(new Iframe(`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track}&color=%23387eff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`)
			.setTitle(`${title} — Chiri Vulpes`)
			.setHeight(145));
	}
}

export default new Article("Music")
	.class()
	.header(header => header
		.setNav(nav => nav
			.link("SoundCloud")
			.link("Bandcamp"))
		.markdown(`
			I used to make music a lot, but not too much anymore. Generally I only make music at this point when I need it for something, like a game. Here's a selection of some of my favourite songs I made, though:`)
		.append(new Soundcloud("661307534", "Moore's Law"))
		.append(new Soundcloud("1058446651", "Dig Dig Dig"))
		.append(new Soundcloud("1058450002", "Insufficient Sleep"))
		.append(new Soundcloud("586701027", "Blink and You'll Miss It")));
