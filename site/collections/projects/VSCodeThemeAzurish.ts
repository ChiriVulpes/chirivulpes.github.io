import Element from "@element/Element";
import Project from "site/collections/projects/Project";

export default new Project("VSCode Azurish Theme")
	.setImage("https://aarilight.gallerycdn.vsassets.io/extensions/aarilight/theme-azurish/1.7.2/1630712818512/Microsoft.VisualStudio.Services.Icons.Default", image => image
		.class("borderless"))
	.setType("Utilities, Other")
	.setLink("https://github.com/ChiriVulpes/vscode-azurish")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2017-present. "))
		.text("An azurish code syntax and application theme for VSCode."))
	.setDescription(`
		A theme initially inspired by Azure for Sublime, Azurish has been maintained and improved for nearly four and a half years! It's the only theme I've ever used for VSCode, and I don't think I'll ever change, either.`);
