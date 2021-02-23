import { ITaskApi } from "./TaskRunner";

export type TaskFunction<T> = (api: ITaskApi) => T;

export default function <T> (name: string, task: TaskFunction<T>) {
	Object.defineProperty(task, "name", { value: name });
	return task;
}