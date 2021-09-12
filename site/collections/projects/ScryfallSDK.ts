import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("scryfall-sdk")
	.setOrder(3)
	.setType("Utilities, Other")
	.setLink("https://github.com/ChiriVulpes/scryfall-sdk")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2017-present. "))
		.text("A fully-featured SDK for interacting with the Scryfall website in Node.js, written in TypeScript."))
	.setDescription(`
		scryfall-sdk was made when I was working on an MTG card collection app. I never ended up finishing the app because I stopped playing MTG, but I still actively maintain the SDK.`);
