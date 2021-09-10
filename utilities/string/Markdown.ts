import { PromiseOr } from "@util/Type";
import highlightjs from "highlight.js";
import marked from "marked";
import prism from "prismjs";
import loadLanguages from "prismjs/components/";
import striptags from "striptags";

loadLanguages(["typescript"]);

marked.setOptions({
	highlight: function (code, language) {
		let highlighted = highlightjs.highlight(code, { language: "typescript" }).value;

		let oldLength = highlighted.length;
		while (oldLength !== (highlighted = highlighted.replace(/<span class="([\w\s-]*)">((?:(?!<span).)*?)<\/span>/g, "/* $1 */ $2 /* /$1 */ ")).length)
			oldLength = highlighted.length;

		highlighted = highlighted
			.replace(/&quot;/g, '"')
			.replace(/&gt;/g, ">")
			.replace(/&lt;/g, "<")
			.replace(/\/\* \/?hljs-comment \*\/ ?/g, "");

		return prism.highlight(highlighted, prism.languages.typescript, "typescript")
			.replace(/<span class="token comment">\/\* hljs-(\w+(?: \w+)*) \*\/<\/span> /g, '<span class="$1">')
			.replace(/ <span class="token comment">\/\* \/hljs-(\w+(?: \w+)*) \*\/<\/span> /g, "</span>")
			.replace(/(?<=class="[\w ]+?)_+\b/g, "");
	},
});

namespace Markdown {

	export function preview (markdown: string) {
		return striptags(markdown)
			.split("\n")
			.reduce((prev, curr) => {
				prev.textLength ??= 0;
				if (prev.textLength < 512) {
					prev.push(curr);
					prev.textLength += curr.length;
				}
				return prev;
			}, [] as string[] & { textLength?: number })
			.join("\n");
	}

	export interface IFilter {
		start: string;
		replace (markdown: string, cursor: number): PromiseOr<{ insert: string, cursor: number } | undefined>;
	}

	export function registerFilter (filter: IFilter) {
		markdownFilters.push(filter);
	}

	const markdownFilters: IFilter[] = [];

	registerFilter({
		start: "`",
		replace (markdown, i) {
			let code = "";
			for (; i < markdown.length; i++) {
				const char = markdown[i];
				if (char === "`")
					break;
				code += char;
			}

			i++;

			if (markdown[i++] !== "{" || markdown[i++] !== ":" || markdown[i++] !== ".")
				return undefined;

			let classes = "";
			for (; i < markdown.length; i++) {
				const char = markdown[i];
				if (char === "}")
					break;
				classes += char;
			}

			return { insert: `<code class="${classes.replace(/\./g, " ")}">${code}</code>`, cursor: i };
		},
	})

	export async function compile (markdown: string) {
		let replacementMarkdown = "";
		let minIndent = Infinity;
		let indent = Infinity;
		NextChar: for (let i = 0; i < markdown.length; i++) {
			for (const filter of markdownFilters) {
				if (markdown.substringAt(filter.start, i)) {
					const result = await filter.replace(markdown, i + filter.start.length);
					if (result) {
						replacementMarkdown += result.insert;
						i = result.cursor;
						continue NextChar;
					}
				}
			}

			const char = markdown[i];
			replacementMarkdown += char;

			if (char === "\n" || char === "\r")
				indent = 0;
			else if (char === "\t" && indent >= 0)
				indent++;
			else {
				minIndent = Math.min(indent, minIndent);
				indent = Infinity;
			}
		}

		if (minIndent > 0 && minIndent < Infinity)
			replacementMarkdown = replacementMarkdown.unindent(minIndent);

		return new Promise<string>((resolve, reject) => marked(replacementMarkdown, (err, html) => {
			if (err)
				reject(err);
			else
				resolve(html.trimEnd().replace(/ {4}/g, "\t"));
		}));
	}

}

export default Markdown;
