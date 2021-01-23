document.querySelectorAll("article")
	.forEach(articleElement => articleElement
		.addEventListener("click", event => !event.target.closest("a, iframe")
			&& articleElement.querySelector("h2 a")?.focus()));
