import DefaultPage from "../layout/DefaultPage";
import Heading from "../utilities/document/elements/Heading";
import Thumbnail from "../utilities/document/elements/Thumbnail";

export default new DefaultPage()
	.append(new Heading(3)
		.text("Hi there!"))
	.append(new Heading(2)
		.text("wow"))
	.append(new Thumbnail("art/trolls-and-tribulations-fanart", 200));
