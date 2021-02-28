import Article from "@element/Article";
import { Fragment } from "@element/Element";
import Iframe from "@element/Iframe";

export default new Article("Music")
	.class("inactive")
	.header(header => header
		.setNav(nav => nav
			.link("SoundCloud")
			.link("Bandcamp"))
		.append(new Fragment()
			.markdown(`
				I used to make music a lot, but not too much anymore. It never really clicked for me like other things that I do, it was always a struggle to make anything. I could never produce the sound I wanted to, even if I knew exactly what I wanted, and that just made it a struggle. Maybe someday I'll pick it up again and figure things out further.

				For what it's worth, here's the song I'm proudest of:`))
		.append(new Iframe("https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/661307534&color=%23387eff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true")
			.setTitle("Moore's Law — Chirichirichiri")
			.setHeight(166)));
