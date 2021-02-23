import ansi from "ansicolor";
import globby from "globby";
import mkdirp from "mkdirp";
import fs from "mz/fs";
import path from "path";
import Log from "../../shared/utilities/Log";
import { elapsed, stopwatch } from "../../shared/utilities/Time";
import Page from "./Page";

module Site {

	let _root = ".";

	export function root (path: string) {
		_root = path;
	}

	function outPath (file: string) {
		return path.resolve(_root, file);
	}

	export async function write (name: string, contents: string) {
		name = outPath(name);
		await mkdirp(path.dirname(name));
		return fs.writeFile(name, contents);
	}

	// export async function add (page: string) {
	// 	let pageExport: Page | undefined;
	// 	const resolvedPagePath = require.resolve(`../page/${page}.ts`);
	// 	pageExport = require(resolvedPagePath)?.default;

	// 	if (!(pageExport instanceof Page)) {
	// 		Log.error(`Invalid default export for page ${ansi.cyan(path.relative(process.cwd(), resolvedPagePath))}: ${pageExport}`);
	// 		return;
	// 	}

	// 	return write(`${page.toLowerCase()}.html`, pageExport.compile(!!process.env.indent));
	// }

	export async function addPages (root: string) {
		const cwd = process.cwd();

		const globWatch = stopwatch();
		const typescriptFiles = await globby(`${root}/**/*.ts`);
		globWatch.stop();

		Log.info(`Discovered ${ansi.green(`${typescriptFiles.length}`)} potential pages in`, globWatch.time());

		for (const file of typescriptFiles) {
			let potentialPage: unknown;
			let loadWatch = stopwatch();
			try {
				potentialPage = require(path.join(cwd, file))?.default;
			} catch (err) {
				Log.error(`Ignoring file ${ansi.cyan(file)}, encountered error`, err);
				continue;
			}

			loadWatch.stop();

			if (!(potentialPage instanceof Page)) {
				Log.info(`Ignoring non-page`, ansi.cyan(file));
				continue;
			}

			const newFile = path.basename(path.relative(root, file), ".ts").toLowerCase();
			try {
				const compileWatch = stopwatch();
				const compiled = await potentialPage.compile(!!process.env.indent);
				compileWatch.stop();

				const writeWatch = stopwatch();
				await write(`${newFile}.html`, compiled);
				writeWatch.stop();

				Log.info("Loaded page", ansi.cyan(file), "in", loadWatch.time(),
					"- compiled in", compileWatch.time(),
					"- written in", writeWatch.time(),
					"- total time", elapsed(loadWatch.elapsed + compileWatch.elapsed + writeWatch.elapsed));
			} catch (err) {
				Log.error(`Ignoring page ${ansi.cyan(file)}, encountered error in compilation`, err);
			}
		}
	}
}

export default Site;
