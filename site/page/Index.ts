import Heading from "@element/Heading";
import Thumbnail from "@element/Thumbnail";
import DefaultPage from "@layout/DefaultPage";

export default new DefaultPage()
	.append(new Heading(3)
		.text("Hi there!"))
	.append(new Heading(2)
		.text("wow"))
	.append(new Thumbnail("art/trolls-and-tribulations-fanart", 200));
