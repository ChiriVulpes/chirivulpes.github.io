import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("goodstream")
	.setType("Utilities, Other")
	.setLink("https://github.com/WaywardGame/goodstream")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2019-present. "))
		.text("A node.js module inspired by Java Streams and other similar modules to provide a lot of easy-to-use features for handling IterableIterators at a decently fast clip."))
	.setDescription(`
		While this module is great to use and I've used it in a lot of projects — mainly Wayward — its performance is not amazing and the module needs to be redone due to that.`);
