import chokidar from "chokidar";
import build from "./build";
import clean from "./clean";
import Task from "./utilities/Task";

export default Task("watch", task =>
	chokidar.watch("src/site/**/*.ts", { ignoreInitial: true })
		.on("all", () =>
			task.series(clean, build)));