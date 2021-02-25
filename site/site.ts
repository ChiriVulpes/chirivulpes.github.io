import dotenv from "dotenv";
import ApplyStringPrototypes from "./utilities/prototype/Strings";
import Site from "./utilities/Site";

dotenv.config();
ApplyStringPrototypes();

Site.root("build");
Site.host("chiri.works");

void Site.static("static")
	.then(() => Site.addPages("site/page"));
