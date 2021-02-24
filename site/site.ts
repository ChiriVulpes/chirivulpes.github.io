import dotenv from "dotenv";
import ApplyStringPrototypes from "./utilities/prototype/Strings";
import Site from "./utilities/Site";

dotenv.config();
ApplyStringPrototypes();

Site.root("build");

void Site.static("static");

void Site.write("CNAME", "chiri.works");

void Site.addPages("site/page");
