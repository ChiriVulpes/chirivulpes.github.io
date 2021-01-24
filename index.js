document.querySelectorAll("article")
	.forEach(articleElement => articleElement
		.addEventListener("click", event => !event.target.closest("a, iframe")
			&& articleElement.querySelector("h2 a")?.focus()));

////////////////////////////////////
// Dates
//

const RelativeTime = new Intl.RelativeTimeFormat("en");

function refreshDates () {
	for (const element of document.querySelectorAll("[data-date]")) {
		const date = new Date(element.dataset.date || 0);
		const isToday = date.toDateString() === new Date().toDateString();

		const tooltip = date.toLocaleString(undefined, {
			hour: "numeric", minute: "numeric",
			...isToday ? {} : { year: "numeric", month: "long", day: "numeric" },
		});

		element.textContent = ago(date);
		element.setAttribute("aria-label", element.title = tooltip);
	}
}

refreshDates();

/**
 * @typedef {"year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second"} Timescale
 */

/**
 * @param {Date} date 
 */
function ago (date) {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	/**
	 * @type {[Timescale, number][]}
	 */
	const timescales = [
		["year", 31536000],
		["month", 2592000],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60],
	];

	for (const [name, timescale] of timescales) {
		const interval = Math.floor(seconds / timescale);
		if (interval) return RelativeTime.format(-interval, name);
	}

	return "now";
}
