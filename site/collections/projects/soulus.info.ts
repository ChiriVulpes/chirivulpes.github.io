import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("soulus.info")
	.setType("Websites")
	.setImage("https://soulus.info/data/soulus/soulbook.png", image => image
		.class("borderless"))
	.setLink("https://soulus.info")
	.setDetails(details => details
		.append(new Element("span").class("date").text("December 2018. "))
		.text("A website for my old Minecraft mod, Soulus."))
	.setDescription(`
		Another site hosted on GitHub, soulus.info documents all the features of the mod by importing the data exported straight from the mod itself. It also hosts a player guide and a technical guide.
		
		The website is very JS-heavy and can't be viewed with JS disabled, which is unfortunate. I'm still proud of it, but I'd definitely do things differently nowadays.`);
