import ansi from "ansicolor";
import Log from "../../shared/utilities/Log";
import { stopwatch } from "../../shared/utilities/Time";
import { TaskFunction } from "./Task";

export interface ITaskApi {
	series (...tasks: TaskFunction<any>[]): Promise<void>;
	run<T> (task: TaskFunction<T>): T;
	debounce<T> (task: TaskFunction<T>): void;
}

interface IDebouncedTask {
	promise: Promise<void>;
	count: number;
}

const debouncedTasks = new Map<TaskFunction<any>, IDebouncedTask>();

const taskApi: ITaskApi = {
	async series (...tasks) {
		for (const task of tasks)
			await this.run(task);
	},
	/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
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
				Log.error(`Task ${taskName} errored after ${time}`, err);
			else
				Log.info(`Finished ${taskName} in ${time}`);
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
	/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
	debounce (task) {
		let debouncedTask = debouncedTasks.get(task);
		if (!debouncedTask) {
			debouncedTask = {
				promise: Promise.resolve(),
				count: 0,
			};
			debouncedTasks.set(task, debouncedTask);
		}

		if (debouncedTask.count <= 1) {
			debouncedTask.count++;
			debouncedTask.promise = debouncedTask.promise.then(async () => {
				await task(this);
				debouncedTask!.count--;
			});
		}
	},
};

////////////////////////////////////
// Code
//

const [, , ...tasks] = process.argv;
void (async () => {
	for (const task of tasks) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
			const taskFunction = require(`../${task}.ts`)?.default;
			if (!taskFunction)
				throw new Error(`No task function found by name "${task}"`);

			await taskApi.run(taskFunction);

		} catch (err) {
			Log.error(err);
		}
	}
})();
