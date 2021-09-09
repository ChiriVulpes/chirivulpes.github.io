const RelativeTime = Intl && Intl.RelativeTimeFormat && new Intl.RelativeTimeFormat("en");

function refreshDates () {
	for (const element of document.querySelectorAll<HTMLElement>("[data-date]")) {
		const date = new Date(element.dataset.date ?? 0);
		const isToday = date.toDateString() === new Date().toDateString();

		const tooltip = date.toLocaleString(undefined, isToday ? { hour: "numeric", minute: "numeric" }
			: JSON.parse(element.dataset.format!));

		element.textContent = ago(date);
		element.setAttribute("aria-label", element.title = tooltip);
	}
}

refreshDates();

type Timescale = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second";

function ago (date: Date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	const timescales: [Timescale, number][] = [
		["year", 31536000],
		["month", 2592000],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60],
	];

	for (const [name, timescale] of timescales) {
		const interval = Math[seconds < 0 ? "ceil" : "floor"](seconds / timescale);
		if (interval) return RelativeTime ? RelativeTime.format(-interval, name)
			: interval < 0 ? `in ${-interval} ${name}${interval === 1 ? "" : "s"}`
				: `${interval} ${name}${interval === 1 ? "" : "s"} ago`;
	}

	return "now";
}
