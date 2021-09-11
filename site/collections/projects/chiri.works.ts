import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("chiri.works")
	.setOrder(1)
	.setType("Websites")
	.setImage("logo", image => image
		.class("borderless"))
	.setLink("https://github.com/ChiriVulpes/ChiriVulpes.github.io/")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2021. "))
		.text("Well this is a little meta."))
	.setDescription(`
		This site is entirely static HTML files hosted on GitHub Pages, compiled entirely with a custom build system written in TypeScript. The build system creates HTML documents, compresses thumbnails, and compiles markdown to create the site, which has full mobile, AA, keyboard, and screen reader support. There is very little clientside JS, and nearly all of that JS is just to make things that slight bit more usable.`);
