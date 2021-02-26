export default function <T extends { [key in K]: (...args: any[]) => any }, K extends keyof T> (object: T, method: K, definition: T[K]) {
	Object.defineProperty(object, method, { value: definition });
}
