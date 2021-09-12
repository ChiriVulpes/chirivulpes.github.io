import ApplyArrayPrototypes from "@util/prototype/Arrays";
import ApplyStringPrototypes from "@util/prototype/Strings";
import dotenv from "dotenv";
import Site from "./Site";

dotenv.config();
ApplyStringPrototypes();
ApplyArrayPrototypes();

Site.root("docs");
Site.host("chiri.works");

void Site.static("static")
	.then(() => Site.addPages("site/page"));
