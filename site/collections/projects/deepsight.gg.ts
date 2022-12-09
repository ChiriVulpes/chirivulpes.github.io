import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("deepsight.gg")
	.setOrder(2)
	.setType("Websites")
	.setImage("https://deepsight.gg/image/logo.png", image => image
		.class("borderless"))
	.setLink("https://deepsight.gg")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2022. "))
		.text("A vault manager for Destiny 2, boldly stepping in directions that other vault managers don't."))
	.setDescription(`
		An entirely static web app using entirely client-side TypeScript, hosted on GitHub pages. The only dependency is one that provides some types for interacting with the Bungie API. Pretty experimental in the way it's structured and rendered.
		
		deepsight.gg is a long-term project for me; it's a blank slate for me to add more features and polish to until it's to the point where it's silly for people *not* to use it. And until then, something for me to chip away at whenever I'm in the mood.`);
