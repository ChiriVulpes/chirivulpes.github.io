import DefaultPage from "../layout/DefaultPage";
import Heading from "../utilities/elements/Heading";

export default new DefaultPage()
	.append(new Heading(3)
		.text("Hi there!"))
	.append(new Heading(2)
		.text("wow"));
