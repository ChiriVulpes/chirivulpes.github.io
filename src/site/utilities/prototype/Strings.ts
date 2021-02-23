import Define from "./Define";

declare global {
	interface String {
		indent (count?: number): string;
		indent (indent: string): string;
		indent (count: number, indent: string): string;
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
}
