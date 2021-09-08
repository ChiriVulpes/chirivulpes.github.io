import Define from "./Define";

declare global {
	interface String {
		indent (indentStart?: false): string;
		indent (count?: number, indentStart?: false): string;
		indent (indent: string, indentStart?: false): string;
		indent (count: number, indent: string, indentStart?: false): string;

		unindent (count: number): string;

		prettyFile (): string;

		sentence (): string;

		removeFromStart (substr: string): string;
		removeFromEnd (substr: string): string;

		substringAt (substr: string, index: number): boolean;
	}
}

export default function () {
	Define(String.prototype, "indent", function (this: string, countOrIndent?: number | string | boolean, indent?: string | boolean, indentStart?: boolean) {
		if (typeof countOrIndent === "boolean")
			indentStart = countOrIndent, countOrIndent = undefined;

		if (typeof indent === "boolean")
			indentStart = indent, indent = undefined;

		if (typeof countOrIndent === "string")
			indent = countOrIndent;
		else
			indent = (indent ?? "\t").repeat(countOrIndent ?? 1);

		const length = this.length;
		let result = indentStart === false ? "" : indent;
		for (let i = 0; i < length; i++) {
			const char = this[i];
			result += char === "\n" ? "\n" + indent : char;
		}

		return result;
	});

	Define(String.prototype, "unindent", function (this: string, count: number) {
		const length = this.length;
		let newString = "";
		let indent = 0;
		for (let i = 0; i < length; i++) {
			const char = this[i];
			if (char === "\n")
				indent = 0;
			else if (char === "\t") {
				if (indent++ < count)
					continue;
			} else
				indent = Infinity;

			newString += char;
		}

		return newString;
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

	Define(String.prototype, "removeFromStart", function (this: string, substr: string) {
		if (!this.startsWith(substr))
			return this;
		return this.slice(substr.length);
	});

	Define(String.prototype, "removeFromEnd", function (this: string, substr: string) {
		if (!this.endsWith(substr))
			return this;
		return this.slice(0, -substr.length);
	});

	Define(String.prototype, "substringAt", function (this: string, substr, index) {
		for (let i = 0; i < substr.length; i++)
			if (this[index + i] !== substr[i])
				return false;

		return true;
	});
}
