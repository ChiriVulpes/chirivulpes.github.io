import chokidar from "chokidar";
import build from "./build";
import clean from "./clean";
import Task from "./utilities/Task";

export default Task("watch", task =>
	chokidar.watch(["site/**/*.ts", "style/**/*.scss", "static/**/*"], { ignoreInitial: true })
		.on("all", () =>
			task.series(clean, build)));