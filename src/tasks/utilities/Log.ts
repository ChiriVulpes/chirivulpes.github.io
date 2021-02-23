import { timestamp } from "./Time";

module Log {
	export function info (...what: any[]) {
		console.log(timestamp(), ...what);
	}

	export function warn (...what: any[]) {
		console.warn(timestamp("yellow"), ...what);
	}

	export function error (...what: any[]) {
		console.error(timestamp("red"), ...what);
	}
}

export default Log;
