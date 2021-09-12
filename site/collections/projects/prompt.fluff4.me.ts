import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("prompt.fluff4.me")
	.setOrder(1)
	.setType("Websites")
	.setImage("https://fluff4.me/img/logos/flag/logo.png", image => image
		.class("borderless"))
	.setLink("https://prompt.fluff4.me")
	.setDetails(details => details
		.append(new Element("span").class("date").text("November 2020. "))
		.text("A website that generates random transformative story prompts. Open-source; variations provided by contributors."))
	.setDescription(`
		A single-page application hosted on GitHub Pages. No dependencies outside of polyfills. I'm quite proud of this one, it's simple but very polished.`);
