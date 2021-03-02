import Log from "@util/Log";
import { Stopwatch, stopwatch } from "@util/Time";
import { Class } from "@util/Type";
import ansi from "ansicolor";
import globby from "globby";
import path from "path";

namespace Files {
	export async function discoverClasses<T> (cls: Class<T>, directory: string) {
		const cwd = process.cwd();

		const globWatch = stopwatch();
		const typescriptFiles = await globby(`${directory}/**/*.ts`);
		globWatch.stop();

		const className = ansi.green(cls.name);

		Log.info(`Discovered ${ansi.green(`${typescriptFiles.length}`)} potential ${className} instances in`, globWatch.time());

		const results: { file: string, instance: T, time: Stopwatch }[] = [];
		const ignored: string[] = [];
		const totalLoadWatch = stopwatch();
		for (const file of typescriptFiles) {
			const loadWatch = stopwatch();
			let instance: unknown;
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
				instance = require(path.join(cwd, file))?.default;
			} catch (err) {
				Log.error(`Ignoring file ${ansi.cyan(file)}, encountered error`, err);
				continue;
			}

			if (!(instance instanceof cls)) {
				ignored.push(ansi.cyan(file));
				continue;
			}

			loadWatch.stop();
			results.push({ file, instance, time: loadWatch });
		}

		totalLoadWatch.stop();
		Log.info(`Loaded ${ansi.green(`${results.length}`)} ${className} instances in`, totalLoadWatch.time());
		Log.info("Ignored:", ignored.join(", "));

		return results;
	}
}

export default Files;
