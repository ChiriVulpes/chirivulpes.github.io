import del from "del";
import Task from "./utilities/Task";

export default Task("clean", () => del("build"));
