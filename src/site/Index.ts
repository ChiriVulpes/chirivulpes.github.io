import Element from "./utilities/Element";
import ApplyStringPrototypes from "./utilities/prototype/Strings";
import Site from "./utilities/Site";

ApplyStringPrototypes();

Site.root("build");

Site.write("CNAME", "chiri.works");

Site.write("index.html", new Element("html")
	.append(new Element("head")
		.append(new Element("meta")))
	.append(new Element("body")
		.append(new Element("p")
			.text("Hi!")
			.append(new Element("b")
				.text("This is cool."))
			.text("Don't you think so?")
			.append(new Element("button")
				.id("test")
				.class("thing", "hi", "wow")
				.attribute("thing", "cool")
				.append(new Element("div")))))
	.compile(true));
