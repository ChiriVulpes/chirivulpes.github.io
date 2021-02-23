import DefaultLayout from "../layout/DefaultLayout";
import Element from "../utilities/Element";
import Stylesheet from "../utilities/elements/Stylesheet";

export default new DefaultLayout()
	.append(new Stylesheet("test"))
	.append(new Element("h1")
		.text("Hi there!"));
