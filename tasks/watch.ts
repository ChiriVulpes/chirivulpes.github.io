import chokidar from "chokidar";
import build from "./build";
import clean from "./clean";
import Task, { TaskFunction } from "./utilities/Task";

const rebuild: TaskFunction<Promise<void>> = task => task.series(clean, build);

export default Task("watch", task =>
	chokidar.watch(["site/**/*.ts", "site/**/*.md", "style/**/*.scss", "static/**/*", "client/**/*.ts", "utilities/**/*.ts"], { ignoreInitial: true })
		.on("all", () =>
			task.debounce(rebuild)));