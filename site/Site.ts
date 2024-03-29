import Files from "@util/Files";
import Log from "@util/Log";
import { HrefAbsolute } from "@util/string/Strings";
import { elapsed, Stopwatch, stopwatch } from "@util/Time";
import fs from "fs-extra";
import path from "path";
import Page from "./Page";

let _root = ".";
let _host: string | undefined;

function outPath (file: string) {
	return path.resolve(_root, file);
}

export default new class {

	public root (path?: string) {
		if (path !== undefined)
			_root = path;

		return _root;
	}

	public host (host?: string) {
		if (_host === undefined && host !== undefined) {
			_host = host;
			void this.write("CNAME", host);
		}

		return _host;
	}

	public getAbsolute (url: string): HrefAbsolute {
		return `https://${path.join(_host!, url).prettyFile()}` as const;
	}

	public async static (dir: string) {
		const staticWatch = stopwatch();
		await fs.copy(dir, path.join(_root, dir));
		staticWatch.stop();
		Log.info("Copied static directory", Files.loggify(dir), "in", staticWatch.time());
	}

	public async write (name: string, contents: string) {
		name = outPath(name);
		await fs.mkdirp(path.dirname(name));
		return fs.writeFile(name, contents);
	}

	public async add (instance: Page | Page.Proxy, file?: string, root?: string, loadWatch?: Stopwatch) {

		let newFile: string | undefined = instance.route;
		if (!newFile) {
			if (!root || !file) {
				Log.error(`Ignoring page ${file ? Files.loggify(file) : (instance as Page)?.getId()}, no route specified`);
				return;
			}

			newFile = path.relative(root, file).slice(0, -3).toLowerCase();
		}

		if (newFile.startsWith("/"))
			newFile = newFile.slice(1);

		if (instance instanceof Page.Proxy) {
			const proxy = instance;
			await proxy.promise;
			instance = proxy.supplier();
			if (!instance) {
				Log.error("Ignoring proxy page, no page to proxy");
				return;
			}
		}

		instance.log.setSources(Files.loggify(newFile)); // Add page url to its log

		// if (!newFile.endsWith("index"))
		// 	newFile += "/index";

		const url = newFile.endsWith("index") ? newFile.slice(0, -5) : newFile;
		instance.metadata.setURL(`https://${path.join(_host!, url).prettyFile()}` as const);

		try {
			const indent = !!process.env.indent;
			const precompileWatch = stopwatch();
			await instance.doPrecompile(indent);
			precompileWatch.stop();

			const compileWatch = stopwatch();
			const compiled = await instance.doCompile(indent);
			compileWatch.stop();

			const writeWatch = stopwatch();
			const writeFile = newFile.endsWith(".html") || newFile.endsWith(".xml") ? newFile
				: `${newFile}.html`;
			await this.write(writeFile, compiled);
			writeWatch.stop();

			Log.info("Loaded page", Files.loggify(file ?? newFile), ...loadWatch ? ["in", loadWatch?.time()] : [],
				"- compiled in", compileWatch.time(),
				"- written", writeFile, "in", writeWatch.time(),
				"- total time", elapsed((loadWatch?.elapsed ?? 0) + compileWatch.elapsed + writeWatch.elapsed + precompileWatch.elapsed));
		} catch (err) {
			Log.error(`Ignoring page ${Files.loggify(file ?? newFile)}, encountered error in compilation`, err);
		}
	}

	public async addPages (root: string) {
		const pages = await Files.discoverClasses(Page, root);
		for (const { file, value, time: loadWatch } of pages)
			await this.add(value, file, root, loadWatch);

		const proxies = await Files.discoverClasses(Page.Proxy, root);
		for (const { file, value, time: loadWatch } of proxies)
			await this.add(value, file, root, loadWatch);
	}
};
