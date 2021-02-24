import dotenv from "dotenv";
import ApplyStringPrototypes from "./utilities/prototype/Strings";
import Site from "./utilities/Site";

dotenv.config();
ApplyStringPrototypes();

Site.root("build");

Site.static("static");

Site.write("CNAME", "chiri.works");

Site.addPages("site/page");
