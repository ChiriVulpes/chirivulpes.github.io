import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("Soulus")
	.setType("Games")
	.setImage("https://soulus.info/data/soulus/soulbook.png", image => image
		.class("borderless"))
	.setLink("https://soulus.info/download/")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2017-2020. "))
		.text("A Minecraft mod for ")
		.append(new Element("span").class("length").text("1.12"))
		.text(" that aimed to blend well with vanilla, adding its mechanics and features in a way that encouraged interoperability with the base game's features."))
	.setDescription(`
		Soulus was a mod about digging up fossils to get the "essence" of creatures, and then using that essence to spawn them. The middle-game had you constructing a multi-block auto-crafting table that worked with redstone or player interaction and used living creatures as fuel. The late-game had you creating entity teleporters and chunk-loaders.
		
		For what it had, I'm proud of Soulus. If I were to port it to newer versions of Minecraft, I'd probably restart it, though. It did have a lot of flaws.`);
