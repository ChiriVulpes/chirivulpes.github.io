import Article from "@element/Article";
import Project from "site/collections/projects/Project";

export default new Article<Project>("Programming")
	.header(header => header
		.setNav(nav => nav
			.link("GitHub")))
	.setContainsCards(Project, "site/collections/projects", "type");
