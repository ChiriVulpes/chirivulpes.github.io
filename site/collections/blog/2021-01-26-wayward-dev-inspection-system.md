---
date: 2021-01-25T14:11:09.277Z
title: "Wayward: Evolution of the inspection/tooltip system"
tags: wayward, programming
---

Wayward's UI has evolved a lot over the years, and in recent years most of those changes have been me redoing things. Recently — over the past two versions — I've been doing a lot of work on the inspection system, trying to make it more powerful for all the cases we need it. But I figured that there might be people interested in seeing the whole evolution of it!

Also, if you stick around to the end, some fun new features will be shown off. Get excited!

#### The inception of "world tooltips"
World tooltips were first introduced in Wayward Beta 2.1 "Appearance", allowing you to hover over doodads, creatures, corpses, and more. Here's a couple examples of tooltips from back then:

![Wayward Beta 2.1 &quot;Appearance&quot; Berry Bush tooltip](static/image/article/2021-01-26/wayward-2.1-doodad-inspection)
![Wayward Beta 2.1 &quot;Appearance&quot; Rabbit and An Animal Skull tooltip](static/image/article/2021-01-26/wayward-2.1-creature-inspection)

The way tooltips were implemented back then was basically hardcoded text interpolated with specific values where necessary. Think like `"You dropped the {0}."`{:.string} being interpolated with `"branch"`{:.string} to form `"You dropped the branch."`{:.string}

Some text in the tooltips used a translateable "dictionary" which was shared with messages, and other text was just hardcoded — no way for translators to change it in other languages. The way it was generated also meant it was impossible for the tooltip to have granular updates — the system just didn't allow for that kind of thing. No, if a part of a tooltip needed to be refreshed, the _entire_ thing had to be.

There wasn't anything super inherently bad or wrong about this — it was just the initial implementation. Like all aspects of Wayward, they're improved and reworked and polished version-to-version. There definitely were places that could use big improvements, but, well, that could come with time. And it did!

#### The New UI, new Translation system, and new event system

Now I'm going to get a bit sidetracked, and take you on an adventure through some of my other big projects in Wayward's history. These ones I'm bringing up are important, though, because without them the new inspection system couldn't function!

##### New UI
I joined the Wayward team right near the beginning of development on Wayward Beta 2.3 "Expression", and I helped ship the UI of the character creator. After getting my bearings for a couple updates, in Wayward Beta 2.5 "Kinship" I redesigned every one of the game's menus. This meant the title screen, the options menus, little interrupts that confirm if you want to do something, you name it. These changes were the introduction of the "New UI", a rewriting project which has been ongoing ever since.

##### New Translation system
I made another change in Wayward Beta 2.6 "Mercantile" which greatly impacted the game — a new system to manage the massive amount of language there was. Originally the game had a lot of translations using multiple systems — for example, there were four ways just to _get_ translations (these are all a bit technical):
- Combining a `prefix`{:.property}, `name`{:.property}, and `suffix`{:.property} stored by the language system in the definition of a creature/item/doodad.
- There was a helper to return a translation when given its dictionary and entry and "translation type" (which could be `prefix`{:.property}, `name`{:.property}, `suffix`{:.property}, or `description`{:.property} I believe.) If none were given, all translation types would be returned.
- There was a helper to get a combined translation (`prefix`{:.property} + `name`{:.property} + `suffix`{:.property}) of a translation.
- There was a newer replacement `Translation`{:.class} class whose instances targeted a single translation and could accept arguments to interpolate into the translation.

And none of that even gets into the fact that for all the remaining old UI, the translations were applied into the elements by selectors and directly replacing their text — that was one of the language system's responsibilities rather than the UI!

Anyway, yeah, in 2.6 the entirety of that system was rewritten, resulting in all translations using the same `Translation`{:.class} class that could automatically handle adding new dictionaries, could interpolate all kinds of arguments into translations, and even supported additional different "kinds" of interpolations — fun aspects of this will pop up later in this article.

One impact that this system had on the existing tooltips is that a lot of them were now creating a lot of `Translation`{:.class}  instances at a pretty fast rate, and a lot of the time that was unnecessary. But it wasn't enough to impact the performance to a worrying degree — there _were_ optimisations in place and such — but more improvements would come as the game evolved.

##### New Event system
Wayward's event systems have gone through a few iterations:
1. Hooks
	- 2.0-2.5 — A hook system where mod classes contain hardcoded hook names that can be overridden, and any place where the hooks are called needs to reference the mod system. Mods need to opt into which hooks they're using by listing them in their `mod.json` file.
	- 2.6 — A new hook system that centralises hook definitions and supports more kinds of hooks. (More than just calling them and getting an array of results.) Mods no longer have the hook names baked into themselves, instead they're baked into an `IHookHost`{:.class} which any class can hook into.
2. Other internal event emitters
	- 2.5-2.7 — A simplistic emitter system for emitting and subscribing to events. This wasn't used in too many places, but enough that it was an important part of the game's backend.

In Wayward Beta 2.8 "Odds & Ends", the newer hook system and the event emitter system were combined into the new event system. Initially it was very experimental, I had no idea if what I was doing would actually be possible. Basically what I wanted (and succeeded in doing) was (again, a bit technical):
- Any object can have an event emitter in itself which can emit strongly-typed events.
- Any subscriber can subscribe to an event whenever it's emitted by any instance of a class.
- Some classes are registered as "event buses", and a subscriber can choose to subscribe to events from these rather than specific classes. This is mostly set up to help modders find useful events.
- All event subscription is strongly-typed, whether via an `@EventHandler`{:.function} decorator, a `subscribe()`{:.function} function call, etc.
- Plus any other improvements to different "kinds of hooks" that I mentioned above.

#### New UI inspections: Take 1
In Wayward 2.7 "Deserted Trials" I tackled an "inspections" system for the first time. I believe the initial problem which got me to work on the system was related to bugs found for the old world tooltips, potentially this bug: [Fixed world tooltips from rapidly flashing on/off if hovering over an object while using an item/performing actions.](https://trello.com/c/Y5sPmot1/6387-fixed-world-tooltips-from-rapidly-flashing-on-off-if-hovering-over-an-object-while-using-an-item-performing-actions-thanks-monke)

The way I implemented the system was vague in that it supported any number of "inspection" types on any given tile, and it would show them all separately in the tooltip.

![Wayward Beta 2.7 &quot;Deserted Trials&quot; Rabbit and An Animal Skull tooltip](static/image/article/2021-01-26/wayward-2.7-creature-inspection)

It also was written in a way which supported modders creating their own inspection types, which was something I thought would be helpful for more technical mods. Back then the example I gave was to imagine a "heat" mod which added heat to every tile, and they could register an inspection type which showed the heat of each tile.

Unfortunately, the system was still fundamentally flawed — although it was definitely more powerful, and better for modders, it wasn't great at updating itself. The way the tooltip was generated was basically a really big chain of data processing that built a tooltip out of the inspection types. 

<details>
<summary>Here is that awful mess in all its glory.</summary>

```ts
public static inspect(inspector: Human, tilePosition: Vector3, context: InspectionContext | string): IterableIterator<IInspectionSectionSimple> {
	const tile = game.getTile(...tilePosition.xyz);

	const inspection = new Inspection(inspector, context, tile, tilePosition);

	return Enums.entries(InspectType)
		// if this is inspection is for a tooltip, we filter by the types of inspections the player has chosen to include there
		.filter(([, inspectType]) => context !== InspectionContext.Tooltip || saveDataGlobal.options.tooltips[inspectType] !== false)
		// get the inspection handlers from the inspect types that should be shown
		.map(([name, inspectType]) => tuple(name, inspections[inspectType]))
		.filter2<[string, IInspectionHandler | IInspectionHandler["handle"]]>(([name, handler]) => handler)
		.map<IInspectionHandler>(([name, handler]) => ({
			priority: BasicInspectionPriority[name as keyof typeof BasicInspectionPriority] || 0,
			... typeof handler === "object" ? handler : { handle: handler }
		}))
		// sort the inspections by their priority
		.collect(Collectors.toArray)
		.sort((a, b) => a.priority! - b.priority!)
		.values()
		// use those inspection handlers to get the final list of all inspections, separated by "section", eg a doodad or a player 
		.map(handler => (handler.handle(inspection) || []).values())
		.flatMap()
		.filter<undefined>(inspectionSection => inspectionSection)
		// we could have an IInspectionSection object or the content of one, but we need to always return an IInspectionSection
		.map(section => {
			const content = isIterable(section) ? section : section.content;
			section = isIterable(section) ? { content } : section;
			section.content = content.values()
				.map(inspectionText => inspectionText instanceof Translation ? { text: inspectionText } : inspectionText)
				.filter<undefined>(inspectionText => inspectionText);
			return section as IInspectionSectionSimple;
		})
		// filter out inspection sections with no content
		.filter(inspectionSection => {
			const [hasAny, content] = inspectionSection.content.collect(Collectors.hasAny);
			inspectionSection.content = content;
			return hasAny;
		});
}
```
</details>

If you couldn't tell, that was completely unmaintainable and it also had issues: namely, when a bit of it had to update, the entire thing had to. Wait... isn't that the exact same issue that the old stuff had? Yep!

#### New UI inspections: Take 2

The new inspection system was created in Wayward Beta 2.9 "Seafarer", and since then it's served us rather nicely. The core idea of the system is very similar to the old one, but with a key difference: every single portion of the tooltip, rather than just being an object defining the translation to use and how to display it, is instead an instance of an `InfoProvider`{:.class} class. This class is responsible for initialising its own UI component, and updating its text when necessary.

All three of the technologies I listed above are necessary in making this system work:
- The New UI stuff is rather obvious, I couldn't make the UI components anywhere near as easily if not for that system and the work that's been put into it.
- The translation system also plays a huge role — being able to save objects that store lots of information about a translation and how to render it is incredibly important.
- But _by far_, the _most important_ technology is the event system. The event system allows the `InfoProvider`{:.class} to watch for events on its UI components, it allows it to emit events to its parent `InfoProvider`{:.class}s, it allows it to subscribe to its child ones, and most importantly, it allows it to subscribe to all manner of miscellaneous game events related to the object it's referencing in the first place.

What this means is that I can incredibly easily just throw together an `InfoProvider`{:.class} that can watch some aspect of an object and refresh the translation whenever necessary. And all of it is because of all the other technologies made over the years.

Oh, and the appearance of tooltips was also improved in 2.9 — but that's less related to the tech.

![Wayward Beta 2.9 &quot;Seafarer&quot; Rabbit and An Animal Skull tooltip](static/image/article/2021-01-26/wayward-2.9-creature-inspection)

##### Inspect Dialog

2.9 also saw the introduction of the "Inspect" dialog. This dialog allows inspecting a tile to see the details as you move the mouse to other places. It's useful for keeping track of the status of doodads, for example. The dialog actually uses the same system as the tooltip, internally.

![Wayward Beta 2.9 &quot;Seafarer&quot; Rabbit and An Animal Skull in inspect dialog](static/image/article/2021-01-26/wayward-2.9-creature-inspection-dialog)

#### New UI inspection 2.10 updates

In Wayward Beta 2.10 "Seafarer+", the inspection system of Wayward has gotten a lot of additional work put into it. Again, this was one of those things that took the culmination of a few technologies:

##### The "reference" system

Until now, the game has had no way to store permanent references to specific objects. For example, even though an item has an ID, when the item is removed or you go to a different island, the same ID can be used to reference a completely different item. The same was true for all kinds of objects, from creatures to doodads to even NPCs.

However, I had a use case for a system that allowed keeping track of all objects, so I designed a system that could keep track of everything in this way. The way the reference system works is pretty simple:
- All save games contain a single "reference manager" which has an integer that gets incremented whenever a new reference ID is required.
- Whenever a new object is created, they're assigned a reference ID. In old games, with objects that don't have reference IDs, they're assigned them as part of save upgrading.
- When something needs to get the object referenced by a specific ID, they say, "hey, game, gimme the item by reference ID 12!" and the game loops through all the items looking for one with ID 12.
	- Note: Yes, this is not very performant, but the system is not meant to be performant. There are very, very few cases where reference IDs should be useful.
- The system also supports getting any object referenced by an ID, since no ID is shared even between objects of different kinds. For example, "hey, game, gimme the thingymajig by reference ID 12!" and the game loops through all things that have reference IDs and finds the one with that ID. And then the consumer of that thing would be like "ohhh, okay, so it was an item" or whatever.

##### Reference tooltips

So the purpose of the reference system was something called "reference tooltips". Remember how earlier I mentioned that the translation system supports special kinds of interpolations? Well, the purpose was this. At this point, all translations can reference specific game objects, which means...

![Wayward Beta 2.10 &quot;Seafarer+&quot; Giant Rat reference tooltip](static/image/article/2021-01-26/wayward-2.10-creature-inspection-reference)
![Wayward Beta 2.10 &quot;Seafarer+&quot; Swimming reference tooltip](static/image/article/2021-01-26/wayward-2.10-skill-inspection-reference)

Support has been added to hover over tons of different things in messages to get more information about them! This includes items, creatures, doodads, players, NPCs, and even skills! More will be added in the future, too.

And do you see the other new thing in that image?

##### Inspect dialog updates

Any reference tooltip can now be inspected in the inspect dialog, which means you can see additional information in them, and even hover over things in them to see even more information. And any of those tooltips which they themselves are reference tooltips can also be inspected. It's basically like a wiki system that just happens naturally in the game's text!

And this is paired with another work-in-progress improvement that's happening to the inspect dialog...

![Wayward Beta 2.10 &quot;Seafarer+&quot; Item Stack inspect dialog](static/image/article/2021-01-26/wayward-2.10-item-stack-inspection-dialog)

When standing next to a stack of items, you can now inspect the tile with the stack to get details on all of the items!

Note that this is a work-in-progress feature — these item inspections are not 1:1 with the old item tooltips because they're a complete reimplementation of the old ones, this time in the inspect system. If the reimplementation is finished by 2.10's release, I may try to get item reference tooltips to show when you're hovering over items in the old UI. (It's pretty hard and annoying for the systems to mix, so I try not to add new places too often. Generally it's best just to reimplement things in the new systems, but in order to show item tooltips that way I'd have to reimplement *all* of the old item UI, and that's just a huge project. One step at a time, you know?)

Anyway, since the new item tooltips are inspections they can take advantage of tooltip support, so tons of stuff in here will have tooltips. Here's an example:

![Wayward Beta 2.10 &quot;Seafarer+&quot; Item Stack inspect dialog with tooltip over usage](static/image/article/2021-01-26/wayward-2.10-item-stack-inspection-dialog-2)

And I guess that's about all I have to share! Sorry this post has been so wordy... I had a lot more to talk about than I realised I did. For anyone who managed to stick through this whole thing, thank you! I'll see if I can make another post soon talking about some more Wayward things.
