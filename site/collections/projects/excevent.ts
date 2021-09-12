import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("excevent")
	.setOrder(3)
	.setType("Utilities, Other")
	.setLink("https://github.com/WaywardGame/excevent")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2021. "))
		.text("An incredibly powerful events module written in TypeScript."))
	.setDescription(`
		This module was mostly meant for games and applications, but I could see it having other uses too.
		
		Classes can contain event emitters under an 'event' field, which can be subscribed to and emitted from, and which are all strongly-typed using an interface containing the class's events.
		
		Other classes can subscribe their methods to events emitted by a class, a class instance, or event an 'event bus' which emitters can be registered to by other means.
		
		Once you start working with this, it's kinda hard to go back. Powerful event support is just too valuable to lose.`);
