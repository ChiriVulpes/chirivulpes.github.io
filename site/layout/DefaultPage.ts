import MetaLink, { MetaLinkType } from "../utilities/elements/MetaLink";
import Page from "../utilities/Page";

export default class DefaultLayout extends Page {
	public constructor () {
		super();
		this.requireStyles("index");

		new MetaLink(MetaLinkType.Preconnect, "https://fonts.gstatic.com")
			.appendTo(this.head);

		new MetaLink(MetaLinkType.SiteIcon, "/static/image/logo.png")
			.appendTo(this.head);

		this.setTitle("Chiri Vulpes &nbsp;| &nbsp;Author ∙ Designer ∙ Developer");
	}
}
