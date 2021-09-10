import del from "del";
import Task from "./utilities/Task";

export default Task("clean", () => del("build"));
export const cleanWatch = Task("cleanWatch", () => del(["build/**", "!build", "!build/static", "!build/static/thumb", "!build/static/thumb/**/*"]));
