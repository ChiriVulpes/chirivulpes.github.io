import mkdirp from "mkdirp";
import fs from "mz/fs";
import path from "path";

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
}

export default Site;
