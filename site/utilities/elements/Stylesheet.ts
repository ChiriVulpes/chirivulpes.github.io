import ansi from "ansicolor";
import path from "path";
import sass, { Options, Result } from "sass";
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
		const renderOptions: Options = {
			file: resolvedFile,
			outputStyle: indent ? "expanded" : "compressed", indentType: "tab", indentWidth: 1,
		};
		sass.render(renderOptions, (exception, result) => {
			if (exception) {
				const position = typeof exception.line === "number" ? ansi.yellow(`[${exception.line}:${exception.column}]`) : "";
				let message = exception.message;
				const fileLabel = `${relativeFile}: `;
				if (message.startsWith(fileLabel))
					message = message.slice(fileLabel.length);
				Log.error(`Sass file ${ansi.cyan(relativeFile.prettyFile())}${position} errored after ${compileWatch.time()}:`, ansi.red(message.sentence()));
			}
			resolve(result);
		});
	});
	compileWatch.stop();

	if (result !== null) {
		const prettyFile = relativeFile.prettyFile();
		Log.info("Compiled", ansi.cyan(prettyFile), "in", compileWatch.time());

		compiled = `/* ${prettyFile} */` + (indent ? "\n" : "") + result.css.toString("utf8");
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
		for (const file of this.files) {
			const compiled = await compileStylesheet(file, indent);
			if (compiled.length > 0)
				result += newline + compiled + newline;
		}

		return result;
	}
}
