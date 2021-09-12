import Details from "@element/Details";
import Element from "@element/Element";
import List from "@element/List";
import Project from "site/collections/projects/Project";

export default new Project("WARD")
	.setOrder(2)
	.setImage("https://cdn.discordapp.com/avatars/385018093698547713/09f7a3a3bb3bfa188bcd625d067bbc93.png?size=256")
	.setType("Utilities, Other")
	.setLink("https://github.com/WaywardGame/WARD")
	.setDetails(details => details
		.append(new Element("span").class("date").text("2017-present. "))
		.text("A Discord bot originally made for the Wayward Discord that contains a whole slew of features to help community servers and simplify the jobs of moderators."))
	.setDescription(`
		WARD is written in TypeScript for Node.js. It currently only runs on servers that I've added it to myself, but maybe someday I'll set it up so that it can be on all sorts of servers. It's always been a project I work on out of necessity in servers I moderate and that's it.`)
	.setCardInitialiser(card => card
		.append(new Details(summary => summary.text("Here's a list of plugins I've created for the bot:"))
			.append(new List()
				.add(li => li.text("A \"role toggle\" plugin that allows users to toggle any of a configured list of roles."))
				.add(li => li.text("A \"pronouns\" plugin that allows users to configure any number of custom pronouns for themself, and even supports custom pronouns for different members of plural systems."))
				.add(li => li.text("A \"colours\" plugin that allows users to change their username colour to a hex colour code."))
				.add(li => li.text("A \"welcome\" plugin that can send a randomised welcome message when a new user joins the server or gains a role."))
				.add(li => li.text("A \"spam\" plugin that detects if users join and immediately leave, and detects users that join with bad URLs in their usernames, and bans them."))
				.add(li => li.text("A \"regulars\" plugin for tracking how active users are."))
				.add(li => li.text("A \"reminder\" plugin that I made mostly for myself, which allows you to ask the bot to remind you about things after a set amount of time."))
				.add(li => li.text("A \"giveaway\" plugin that allows the creation of giveaways by mods — users enter the giveaway by reacting to the message."))
				.add(li => li.text("An \"auto role\" plugin which applies roles to users based on the presence of other roles, or other factors."))
				.add(li => li.text("A \"twitch stream\" plugin that can ping users when a specific Twitch streamer or any streamer playing a specific game has gone live."))
				.add(li => li.text("A \"changelog\" plugin that can post and update changes made to a Trello board. Not currently configurable which Trello board or how to parse the data."))
				.add(li => li.text("A \"wish\" plugin that was made in order to facilitate a secret-santa writing giveaway in December 2020."))
				.add(li => li.text("A work-in-progress \"king\" plugin that allows users to play a card game I made a while back called \"king.\"")))));
