import ansi from "ansicolor";
import fs from "fs-extra";
import globby from "globby";
import path from "path";
import Log from "../../shared/utilities/Log";
import { elapsed, stopwatch } from "../../shared/utilities/Time";
import Page from "./Page";

let _root = ".";

function outPath (file: string) {
	return path.resolve(_root, file);
}

export default new class {

	public root (path?: string) {
		if (path !== undefined)
			_root = path;

		return _root;
	}

	public async static (dir: string) {
		const staticWatch = stopwatch();
		await fs.copy(dir, path.join(_root, dir));
		staticWatch.stop();
		Log.info("Copied static directory", ansi.cyan(dir), "in", staticWatch.time());
	}

	public async write (name: string, contents: string) {
		name = outPath(name);
		await fs.mkdirp(path.dirname(name));
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

	public async addPages (root: string) {
		const cwd = process.cwd();

		const globWatch = stopwatch();
		const typescriptFiles = await globby(`${root}/**/*.ts`);
		globWatch.stop();

		Log.info(`Discovered ${ansi.green(`${typescriptFiles.length}`)} potential pages in`, globWatch.time());

		for (const file of typescriptFiles) {
			let potentialPage: unknown;
			const loadWatch = stopwatch();
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
				potentialPage = require(path.join(cwd, file))?.default;
			} catch (err) {
				Log.error(`Ignoring file ${ansi.cyan(file)}, encountered error`, err);
				continue;
			}

			loadWatch.stop();

			if (!(potentialPage instanceof Page)) {
				Log.info("Ignoring non-page", ansi.cyan(file));
				continue;
			}

			const newFile = path.basename(path.relative(root, file), ".ts").toLowerCase();
			potentialPage.log.setSources(ansi.cyan(newFile)); // Add page url to its log 
			try {
				const indent = !!process.env.indent;
				const precompileWatch = stopwatch();
				await potentialPage.precompile(indent);
				precompileWatch.stop();

				const compileWatch = stopwatch();
				const compiled = await potentialPage.compile(indent);
				compileWatch.stop();

				const writeWatch = stopwatch();
				await this.write(`${newFile}.html`, compiled);
				writeWatch.stop();

				Log.info("Loaded page", ansi.cyan(file), "in", loadWatch.time(),
					"- compiled in", compileWatch.time(),
					"- written in", writeWatch.time(),
					"- total time", elapsed(loadWatch.elapsed + compileWatch.elapsed + writeWatch.elapsed + precompileWatch.elapsed));
			} catch (err) {
				Log.error(`Ignoring page ${ansi.cyan(file)}, encountered error in compilation`, err);
			}
		}
	}
};
