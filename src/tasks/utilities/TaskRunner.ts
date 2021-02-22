import ansi, { AnsicolorMethods } from "ansicolor";
import { performance } from "perf_hooks";
import { TaskFunction } from "./Task";

////////////////////////////////////
// Util
//

function stopwatch () {
	const start = performance.now();
	function elapsed () {
		const now = performance.now();
		const elapsed = now - start;
		if (elapsed < 1)
			return `${Math.floor(elapsed * 1_000)} μs`
		if (elapsed < 1_000)
			return `${Math.floor(elapsed)} ms`;
		if (elapsed < 60_000)
			return `${+(elapsed / 1_000).toFixed(2)} s`;
		return `${+(elapsed / 60_000).toFixed(2)} m`;
	}
	return {
		time: () => ansi.magenta(elapsed()),
	};
}

let format = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "numeric", second: "numeric", hour12: false, timeZone: "Australia/Melbourne" });
function timestamp (color: keyof AnsicolorMethods = "darkGray") {
	return ansi[color](format.format(new Date()));
}

function log (...what: any[]) {
	console.log(timestamp(), ...what);
}

function warn (...what: any[]) {
	console.warn(timestamp("yellow"), ...what);
}

function error (...what: any[]) {
	console.error(timestamp("red"), ...what);
}

export interface ITaskApi {
	series (...tasks: TaskFunction<any>[]): Promise<void>;
	run<T> (task: TaskFunction<T>): T;
}

const taskApi: ITaskApi = {
	async series (...tasks) {
		for (const task of tasks)
			await this.run(task);
	},
	run (task) {
		let result: any;
		const taskName = ansi.cyan(task.name);

		log(`Starting ${taskName}...`);
		const watch = stopwatch();

		let err: Error | undefined;
		try {
			result = task(this);
		} catch (caught) {
			err = caught;
		}

		const time = watch.time();
		if (err)
			error(`Task ${taskName} errored after ${time}.`, err);
		else
			log(`Finished ${taskName} in ${time}.`);

		return result;
	},
};

////////////////////////////////////
// Code
//

const [, , ...tasks] = process.argv;
(async () => {
	for (const task of tasks) {
		try {
			const taskFunction = require(`../${task}.ts`)?.default;
			if (!taskFunction)
				throw new Error(`No task function found by name "${task}"`);

			await taskApi.run(taskFunction);

		} catch (err) {
			error(err);
		}
	}
})();
