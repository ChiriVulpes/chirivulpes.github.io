import Element from "@element/Element";
import Nav from "@element/Nav";
import Project from "site/collections/projects/Project";

export default new Project("Wayward")
	.setOrder(2)
	.setType("Games")
	.setAssociatedTag("wayward")
	.setImage("https://cdn.cloudflare.steamstatic.com/steam/apps/379210/header.jpg")
	.setLink("https://www.waywardgame.com")
	.setDetails(details => details
		.text("Available on Steam for ")
		.append(new Element("span").class("price").text("$7.99 US"))
		.text(". \"You awake to discover yourself no longer in the company of good men or a fine seafaring vessel. Treasure... you remember something about treasure.\""))
	.setDescription(`
		I've been a member of the Wayward team since December 2016. Originally my changes were small, but quickly I got into redesigning and reimplementing the UI, and since then I've been active in all aspects of the game, from UI/UX redesign to rewriting systems to improving the modder experience.
		
		I'm not completely happy with Wayward overall yet, but I'm still actively working on it and often adding things that I'm super proud of!`)
	.setCardInitialiser(card => card.parent
		?.insertAfter(card, new Nav()
			.link("Blog", "/blog/tag/wayward")));
