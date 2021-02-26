import Element, { Initialiser } from "@element/Element";
import Heading from "@element/Heading";
import Link from "@element/Link";
import Meta from "@element/Meta";
import Nav from "@element/Nav";
import Page from "../Page";
import Site from "../Site";

export default class DefaultPage extends Page {

	protected _header = new Header()
		.nav(nav => nav
			.link("GitHub", "https://github.com/ChiriCuddles")
			.link("Twitter", "https://twitter.com/ChiriMystere")
			.link("Author Patreon", "https://www.patreon.com/chirichirichiri")
			.link("Discord", "https://discord.gg/XPPvW9F"))
		.appendTo(this);

	protected _main = new Element("main")
		.appendTo(this);

	protected _footer = new Element("footer")
		.append(new Nav()
			.link("GitHub", "https://github.com/ChiriCuddles")
			.link("Twitter", "https://twitter.com/ChiriMystere")
			.link("Discord", "https://discord.gg/XPPvW9F")
			.break()
			.link("Scribble Hub", "https://www.scribblehub.com/profile/12063/chirichirichiri/")
			.link("itch.io", "https://chirichirichiri.itch.io/")
			.link("Patreon", "https://www.patreon.com/chirichirichiri")
			.break()
			.link("YouTube", "https://www.youtube.com/channel/UCePEUnShLHdvPfsjkEH5dDA")
			.link("Twitch", "https://www.twitch.tv/chirichirichiri")
			.link("SoundCloud", "https://soundcloud.com/chirichirichiri")
			.link("Bandcamp", "https://chirichirichiri.bandcamp.com/"))
		.appendTo(this);

	public constructor () {
		super();
		this.requireStyles("index");

		new Meta.Preconnect("https://fonts.gstatic.com")
			.appendTo(this.head);

		new Meta.SiteIcon("/static/image/logo.png")
			.appendTo(this.head);

		this.metadata.setTitle("Chiri Vulpes &nbsp;| &nbsp;Author ∙ Designer ∙ Developer");
		this.metadata.setDescription("Chiri Vulpes is a prolific creator — an author, a designer, a software developer, an artist, and even a composer! Here's some stuff she's made and ways you can get in contact with her.");
		this.metadata.setImage(Site.getAbsolute("static/image/logo.png"));
	}

	public header (initialiser: Initialiser<Header>) {
		initialiser(this._header);
		return this;
	}

	public main (initialiser: Initialiser<Element>) {
		initialiser(this._main);
		return this;
	}

	public footer (initialiser: Initialiser<Element>) {
		initialiser(this._footer);
		return this;
	}
}

export class Header extends Element {

	protected _homeLink = new Link("/")
		.text(Site.host()!)
		.appendTo(new Heading(1)
			.setType("div")
			.id("home")
			.appendTo(this));

	protected _nav = new Nav()
		.appendTo(this);

	public constructor () {
		super("header");
	}

	public homeLink (initialiser: Initialiser<Link>) {
		initialiser(this._homeLink);
		return this;
	}

	public nav (initialiser: Initialiser<Nav>) {
		initialiser(this._nav);
		return this;
	}
}
