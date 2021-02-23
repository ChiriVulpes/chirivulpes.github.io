import Define from "./Define";

declare global {
	interface String {
		indent (count?: number): string;
		indent (indent: string): string;
		indent (count: number, indent: string): string;

		prettyFile (): string;

		sentence (): string;
	}
}

export default function () {
	Define(String.prototype, "indent", function (this: string, countOrIndent: number | string = 1, indent?: string) {
		if (typeof countOrIndent === "string")
			indent = countOrIndent;
		else
			indent = (indent ?? "\t").repeat(countOrIndent);

		return this.replace(/(^|\n)/g, `$1${indent}`);
	});

	Define(String.prototype, "prettyFile", function (this: string) {
		const length = this.length;
		let result = "";
		for (let i = 0; i < length; i++) {
			const char = this[i];
			result += char === "\\" ? "/" : char;
		}
		return result;
	});

	Define(String.prototype, "sentence", function (this: string) {
		return this[0].toUpperCase() + this.slice(1);
	});
}
