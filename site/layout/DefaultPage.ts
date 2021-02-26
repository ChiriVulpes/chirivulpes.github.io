import Meta from "@element/Meta";
import Page from "../Page";
import Site from "../Site";

export default class DefaultPage extends Page {
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
}
