import Article from "@element/Article";

export default new Article("Programming")
	.header(header => header
		.setNav(nav => nav
			.link("GitHub")));
