import { spawn } from "child_process";
import path from "path";
import Task from "./utilities/Task";

export default Task("build", () => new Promise<void>((resolve, reject) => {
	const ext = process.platform === "win32" ? ".cmd" : "";
	const childProcess = spawn(path.resolve("node_modules/.bin/ts-node" + ext), ["-r", "tsconfig-paths/register", "site/main.ts"],
		{ stdio: [process.stdin, process.stdout, process.stderr] });
	childProcess.on("error", reject);
	childProcess.on("exit", code => {
		if (code === 1) reject("Error code 1");
		else resolve();
	});
}));
