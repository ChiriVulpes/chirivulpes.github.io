import ansi, { AnsicolorMethods } from "ansicolor";
import { performance } from "perf_hooks";

export function stopwatch () {
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
export function timestamp (color: keyof AnsicolorMethods = "darkGray") {
	return ansi[color](format.format(new Date()));
}
