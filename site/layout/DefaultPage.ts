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
			.link("GitHub")
			.link("Twitter")
			.link("Patreon", link => link.text(" (Writing)"))
			.link("Discord"))
		.appendTo(this);

	protected _main = new Element("main")
		.appendTo(this);

	protected _footer = new Element("footer")
		.append(new Nav()
			.link("GitHub")
			.link("Twitter")
			.link("Discord")
			.break()
			.link("Scribble Hub")
			.link("itch.io")
			.link("Patreon")
			.break()
			.link("YouTube")
			.link("Twitch")
			.link("SoundCloud")
			.link("Bandcamp"))
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
