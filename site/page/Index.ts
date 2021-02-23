import DefaultLayout from "../layout/DefaultLayout";
import Element from "../utilities/Element";

export default new DefaultLayout()
	.append(new Element("h1")
		.text("Hi there!")
		.requireStyles("test"));
