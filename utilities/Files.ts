import Log from "@util/Log";
import { Stopwatch, stopwatch } from "@util/Time";
import { Class } from "@util/Type";
import ansi from "ansicolor";
import fs from "fs-extra";
import globby from "globby";
import path from "path";

function getDefaultNameOfThings (glob: string) {
	const indexOfDot = glob.lastIndexOf(".");
	if (indexOfDot === -1)
		return "files";

	return ansi.green(glob.slice(indexOfDot)) + " files";
}

namespace Files {

	const regexForwardSlash = /\\/g;
	export function loggify (file: string) {
		if (path.isAbsolute(file))
			file = path.relative(process.cwd(), file);

		return ansi.cyan(file.replace(regexForwardSlash, "/"));
	}

	export interface IResult<T = string> {
		file: string;
		value: T;
		time: Stopwatch;
	}

	export async function discoverFiles (glob: string, nameOfThings = getDefaultNameOfThings(glob)) {
		const globWatch = stopwatch();
		const files = await globby(glob);
		globWatch.stop();

		Log.info(`Discovered ${ansi.green(`${files.length}`)} potential ${nameOfThings} in`, globWatch.time());
		return files;
	}

	export async function discoverClasses<T> (cls: Class<T>, directory: string) {
		const cwd = process.cwd();

		const className = ansi.green(cls.name);
		const typescriptFiles = await discoverFiles(`${directory}/**/*.ts`, `${className} instances`);

		const results: IResult<T>[] = [];
		const ignored: string[] = [];
		const totalLoadWatch = stopwatch();
		for (const file of typescriptFiles) {
			const loadWatch = stopwatch();
			let instance: unknown;
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
				instance = require(path.join(cwd, file))?.default;
			} catch (err) {
				Log.error(`Ignoring file ${loggify(file)}, encountered error`, err);
				continue;
			}

			if (!(instance instanceof cls)) {
				ignored.push(loggify(file));
				continue;
			}

			loadWatch.stop();
			results.push({ file, value: instance, time: loadWatch });
		}

		totalLoadWatch.stop();
		Log.info(`Loaded ${ansi.green(`${results.length}`)} ${className} instances in`, totalLoadWatch.time());
		Log.info("Ignored:", ignored.join(", "));

		return results;
	}

	export async function load (file: string): Promise<IResult | undefined> {
		const cwd = process.cwd();
		const loadWatch = stopwatch();
		let contents: string | undefined;
		try {
			contents = await fs.readFile(path.join(cwd, file), "utf8");
		} catch (err) {
			Log.error(`Ignoring file ${loggify(file)}, encountered error`, err);
			return;
		}

		loadWatch.stop();
		return { file, value: contents, time: loadWatch };
	}
}

export default Files;
