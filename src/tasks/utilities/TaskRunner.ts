import ansi from "ansicolor";
import Log from "./Log";
import { TaskFunction } from "./Task";
import { stopwatch } from "./Time";

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

		Log.info(`Starting ${taskName}...`);
		const watch = stopwatch();

		let err: Error | undefined;
		try {
			result = task(this);
		} catch (caught) {
			err = caught;
		}

		function logResult () {
			const time = watch.time();
			if (err)
				Log.error(`Task ${taskName} errored after ${time}.`, err);
			else
				Log.info(`Finished ${taskName} in ${time}.`);
		}

		if (result instanceof Promise) {
			result = result.then(r2 => {
				logResult();
				return r2;
			});
		} else {
			logResult();
		}

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
			Log.error(err);
		}
	}
})();
