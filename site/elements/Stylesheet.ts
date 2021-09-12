import Element from "@element/Element";
import Log from "@util/Log";
import { stopwatch } from "@util/Time";
import ansi from "ansicolor";
import path from "path";
import sass, { Options, Result } from "sass";

const compiledStylesheets = new Map<string, string | Promise<string>>();

async function compileStylesheet (file: string, indent?: boolean) {
	const resolvedFile = path.resolve(`style/${file}.scss`);
	let compiled = compiledStylesheets.get(resolvedFile);
	if (compiled !== undefined)
		return compiled;

	let resolveStylesheet!: (stylesheet: string) => any;
	compiledStylesheets.set(resolvedFile, new Promise<string>(resolve => resolveStylesheet = resolve))
	const relativeFile = path.relative(process.cwd(), resolvedFile);

	const compileWatch = stopwatch();
	const result = await new Promise<Result | null>(resolve => {
		const renderOptions: Options = {
			file: resolvedFile,
			outputStyle: indent ? "expanded" : "compressed", indentType: "tab", indentWidth: 1,
		};
		sass.render(renderOptions, (exception, result) => {
			if (exception) {
				const position = typeof exception.line === "number" ? ansi.yellow(`:${exception.line}:${exception.column}`) : "";
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

		compiled = result.css.toString("utf8");
		if (compiled.startsWith("\ufeff"))
			// strip BOM
			compiled = compiled.slice(1);

		compiled = `/* ${prettyFile} */` + (indent ? "\n" : "") + compiled;
		if (indent)
			compiled = compiled.indent();
		compiledStylesheets.set(resolvedFile, compiled);
		resolveStylesheet(compiled);
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

	public async precompile (indent: boolean) {
		for (const file of this.files)
			await compileStylesheet(file, indent);
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
