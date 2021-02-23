import DefaultLayout from "../layout/DefaultLayout";
import Heading from "../utilities/elements/Heading";

export default new DefaultLayout()
	.append(new Heading(3)
		.text("Hi there!")
		.requireStyles("test"))
	.append(new Heading(2)
		.text("wow"));
