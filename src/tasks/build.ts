import { spawn } from "child_process";
import path from "path";
import Task from "./utilities/Task";

export default Task("build", () => new Promise<void>((resolve, reject) => {
	const childProcess = spawn(path.resolve("node_modules/.bin/ts-node.cmd"), ["src/site/Index.ts"],
		{ stdio: [process.stdin, process.stdout, process.stderr] });
	childProcess.on("error", reject);
	childProcess.on("exit", resolve);
}));
