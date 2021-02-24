// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../type/webp-converter.d.ts" />

import ansi from "ansicolor";
import fs from "fs-extra";
import jimp from "jimp";
import path from "path";
import webp from "webp-converter";
import Log from "../../../shared/utilities/Log";
import { elapsed, stopwatch } from "../../../shared/utilities/Time";
import Element from "../Element";
import Site from "../Site";

const alreadyCreatedThumbnails = new Set<string>();

export default class Thumbnail extends Element {
	public constructor (private readonly image: string, private readonly size: number, private readonly axis: "x" | "y" = "x") {
		super("picture");
	}

	public async precompile () {
		const file = path.join("static/image", this.image);
		const newFile = path.join(Site.root(), "static/image/thumb", this.image);
		const newFilePng = newFile + ".png";
		const newFileWebp = newFile + ".webp";

		new Element("img")
			.attribute("srcset", "/" + newFilePng)
			.attribute("loading", "lazy")
			.attributes(this)
			.appendTo(this);

		new Element("source")
			.attribute("srcset", "/" + newFileWebp)
			.attribute("type", "image/webp")
			.prependTo(this);

		if (alreadyCreatedThumbnails.has(file))
			return;

		alreadyCreatedThumbnails.add(file);

		const loadWatch = stopwatch();
		const filePng = file + ".png";
		const image = await jimp.read(filePng);
		loadWatch.stop();

		const axis = this.axis;
		const size = this.size;
		const width = axis === "x" ? size : Infinity;
		const height = axis === "y" ? size : Infinity;

		const scaleWatch = stopwatch();
		image.scaleToFit(width, height);
		scaleWatch.stop();

		await fs.mkdirp(path.dirname(newFile));

		const writePngWatch = stopwatch();
		await image.writeAsync(newFilePng);
		writePngWatch.stop();

		const webpWatch = stopwatch();
		const buffer = await image.getBufferAsync(jimp.MIME_PNG)
			.then(buffer => webp.buffer2webpbuffer(buffer, "png", "-q 80"));
		webpWatch.stop();

		// ensure temp folder exists cuz module dum
		await fs.mkdirp("node_modules/webp-converter/temp");

		const writeWebpWatch = stopwatch();
		await fs.writeFile(newFileWebp, buffer);
		writeWebpWatch.stop();

		Log.info("Loaded image", ansi.cyan(filePng.prettyFile()), "in", loadWatch.time(),
			"- rescaled in", scaleWatch.time(),
			"- compressed to webp in", webpWatch.time(),
			"- written in", elapsed(writePngWatch.elapsed + writeWebpWatch.elapsed),
			"- total time", elapsed(loadWatch.elapsed + scaleWatch.elapsed + webpWatch.elapsed + writePngWatch.elapsed + writeWebpWatch.elapsed));
	}
}
