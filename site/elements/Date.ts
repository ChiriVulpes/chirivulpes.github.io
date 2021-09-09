import Element from "@element/Element";

export default class Datetime extends Element {
	public constructor (date: Date) {
		super("span");
		this.attribute("data-date", date.toISOString());

		const format: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", timeZoneName: "short" };
		this.attribute("data-format", JSON.stringify(format));

		const dateString = date.toLocaleString(undefined, format);
		this.attribute("title", dateString);
		this.setAriaLabel(dateString);

		this.text(ago(date));

		this.requireScripts("date");
	}
}

type Timescale = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second";
const RelativeTime = Intl && Intl.RelativeTimeFormat && new Intl.RelativeTimeFormat("en");

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
		if (!interval)
			continue;

		if (RelativeTime)
			return RelativeTime.format(-interval, name);

		if (interval < 0)
			return `in ${-interval} ${name}${interval === 1 ? "" : "s"}`;

		return `${interval} ${name}${interval === 1 ? "" : "s"} ago`;
	}

	return "now";
}
