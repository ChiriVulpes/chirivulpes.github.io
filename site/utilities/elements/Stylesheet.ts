import ansi from "ansicolor";
import path from "path";
import sass, { Result } from "sass";
import Log from "../../../shared/utilities/Log";
import { stopwatch } from "../../../shared/utilities/Time";
import Element from "../Element";

const compiledStylesheets = new Map<string, string>();

async function compileStylesheet (file: string, indent?: boolean) {
	const resolvedFile = path.resolve(`style/${file}.scss`);
	let compiled = compiledStylesheets.get(resolvedFile);
	if (compiled !== undefined)
		return compiled;

	const relativeFile = path.relative(process.cwd(), resolvedFile);

	const compileWatch = stopwatch();
	const result = await new Promise<Result | null>(resolve => {
		sass.render({ file: resolvedFile, outputStyle: indent ? "expanded" : "compressed" }, (exception, result) => {
			if (exception)
				Log.error(`Sass file ${ansi.cyan(relativeFile)} errored after ${compileWatch.time()}:`, exception.formatted);
			resolve(result);
		});
	});
	compileWatch.stop();

	if (result !== null) {
		Log.info("Compiled", ansi.cyan(relativeFile), "in", compileWatch.time());

		compiled = `/* ${relativeFile} */` + (indent ? "\n" : "") + result.css.toString("utf8");
		if (indent)
			compiled = compiled.indent();
		compiledStylesheets.set(resolvedFile, compiled);
	}

	return compiled ?? "";
}

export default class Stylesheet extends Element {

	private readonly files: string[] = [];

	public constructor (...files: string[]) {
		super("style");
		this.add(...files);
	}

	public add (...files: string[]) {
		this.files.push(...files);
		return this;
	}

	protected async compileChildren (indent: boolean) {
		const newline = indent ? "\n" : "";

		let result = "";
		for (const file of this.files)
			result += newline + await compileStylesheet(file, indent) + newline;

		return result;
	}
}
