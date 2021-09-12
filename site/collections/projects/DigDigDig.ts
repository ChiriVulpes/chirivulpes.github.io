import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("Dig Dig Dig")
	.setOrder(1)
	.setType("Games")
	.setImage("https://chiri.works/dig/sprite/tile/explosives.png", image => image
		.class("borderless")
		.style("image-rendering", "pixelated")
		.style("height", "64px"))
	.setLink("https://chiri.works/dig/")
	.setDetails(details => details
		.append(new Element("span").class("date").text("May 2020. "))
		.text("There's gold in these hills! There must be a motherlode in the centre of the earth, you can feel it in your bones... You've created a new mining company — it's riches or bust!"))
	.setDescription(`
		Dig Dig Dig was a game created for the Ludum Dare 48 compo, for the theme Deeper and Deeper. It was made entirely from scratch, using TypeScript and SCSS. And, of course, the sprites, music, and sound effects were all custom as well.
		
		This is an updated version, with slightly-improved UX and some refactors for performance. I had big plans to polish it up further, but got stuck on something. At some point I'll probably go back to it!`);
