import Element from "@element/Element";
import Log from "@util/Log";
import { stopwatch } from "@util/Time";
import ansi from "ansicolor";
import tsconfig from "client/tsconfig.json";
import fs from "fs-extra";
import path from "path";
import typescript, { TranspileOptions } from "typescript";

const compiledScripts = new Map<string, string | Promise<string>>();

const REG_WS = /\r?\n( {4})*/g;

async function compileScript (file: string, indent?: boolean) {
	const resolvedFile = path.resolve(`client/${file}.ts`);
	let compiled = compiledScripts.get(resolvedFile);
	if (compiled !== undefined)
		return compiled;

	let resolveScript!: (script: string) => any;
	compiledScripts.set(resolvedFile, new Promise<string>(resolve => resolveScript = resolve))
	const relativeFile = path.relative(process.cwd(), resolvedFile);

	const compileWatch = stopwatch();
	const source = await fs.readFile(resolvedFile, "utf8");
	compiled = typescript.transpileModule(source, tsconfig as any as TranspileOptions).outputText;
	compileWatch.stop();

	if (!indent)
		compiled = compiled.replace(REG_WS, " ");

	const prettyFile = relativeFile.prettyFile();
	Log.info("Compiled", ansi.cyan(prettyFile), "in", compileWatch.time());

	compiled = `/* ${prettyFile} */` + (indent ? "\n" : "") + compiled;
	if (indent)
		compiled = compiled.indent();
	compiledScripts.set(resolvedFile, compiled);

	compiled ??= "";
	resolveScript(compiled);

	return compiled;
}

export default class Script extends Element {

	private readonly files: string[] = [];

	public constructor (...files: string[]) {
		super("script");
		this.add(...files);
	}

	public add (...files: string[]) {
		this.files.push(...files);
		return this;
	}

	public async precompile (indent: boolean) {
		for (const file of this.files)
			await compileScript(file, indent);
	}

	protected async compileChildren (indent: boolean) {
		const newline = indent ? "\n" : "";

		let result = "";
		for (const file of this.files) {
			const compiled = await compileScript(file, indent);
			if (compiled.length > 0)
				result += newline + compiled + newline;
		}

		return result;
	}
}
