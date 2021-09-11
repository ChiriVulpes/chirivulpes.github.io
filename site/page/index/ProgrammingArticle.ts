import Article from "@element/Article";
import Project, { ProjectType } from "site/collections/projects/Project";

export default new Article<Project, ProjectType>("Programming")
	.header(header => header
		.setNav(nav => nav
			.link("GitHub")))
	.addSection("Games")
	.addSection("Websites")
	.addSection("Utilities, Other")
	.setContainsCards(Project, "site/collections/projects", "type");
