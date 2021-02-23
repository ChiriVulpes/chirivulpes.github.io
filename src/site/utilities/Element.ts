const voidElements = new Set([
	"area",
	"base",
	"br",
	"col",
	"command",
	"embed",
	"hr",
	"img",
	"input",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

const inlineElements = new Set([
	"span",
	"b",
	"i",
	"strong",
	"em",
	"u",
	"br",
	"a",
]);

export abstract class Node {
	abstract isInline (): boolean;
	abstract compile (indent?: boolean): string;
}

type UnresolvedChild = Node | ((element: Element) => Node);
function resolveChild (child: UnresolvedChild) {
	return typeof child === "function" ? child(new Element()) : child;
}

export default class Element extends Node {

	public readonly children: Node[] = [];
	private classes: string[] = [];
	private attributes: Record<string, string> = {};
	private _isInline?: boolean;

	public constructor (public type = "div") {
		super();
	}

	public isInline () {
		return this._isInline ?? inlineElements.has(this.type);
	}

	public setInline () {
		this._isInline = true;
		return this;
	}

	public setBlock () {
		this._isInline = false;
		return this;
	}

	public append (...children: UnresolvedChild[]) {
		this.children.push(...children.map(resolveChild));
		return this;
	}

	public appendTo (element: Element) {
		element.append(this);
		return this;
	}

	public prepend (...children: UnresolvedChild[]) {
		this.children.unshift(...children.map(resolveChild));
		return this;
	}

	public prependTo (element: Element) {
		element.prepend(this);
		return this;
	}

	public insert (at: number, ...children: UnresolvedChild[]) {
		this.children.splice(at, 0, ...children.map(resolveChild));
		return this;
	}

	public insertTo (element: Element, at: number) {
		element.insert(at, this);
		return this;
	}

	public id (id: string) {
		this.attribute("id", id);
		return this;
	}

	public class (...classes: string[]) {
		this.classes.push(...classes);
		return this;
	}

	public attribute (name: string, value: string) {
		this.attributes[name] = value;
		return this;
	}

	public text (text: string) {
		this.append(new Text(text));
		return this;
	}

	public compile (indent = false) {
		const type = this.type;
		const isVoid = voidElements.has(type);
		let postTag = isVoid ? "" : `</${type}>`;

		const childElements = this.children;
		if (childElements.length > 0) {
			if (isVoid)
				throw new Error(`Void element "${type}" cannot have children`);

			let actuallyIndent = true;
			const compiledChildren = childElements.map(element => {
				if (element.isInline())
					actuallyIndent = false;
				return element.compile(indent);
			});

			const newline = indent && actuallyIndent ? "\n" : "";
			const contents = compiledChildren.join(newline);

			postTag = `${newline}${indent && actuallyIndent ? contents.indent() : contents}${newline}${postTag}`;
		}

		const classes = this.classes.length === 0 ? "" : ` class="${this.classes.join(" ")}"`;
		const attributes = Object.entries(this.attributes)
			.map(([name, value]) => ` ${name}="${value}"`)
			.join("");

		return `<${type}${classes}${attributes}${isVoid ? "/" : ""}>${postTag}`
	}
}

export class Text extends Node {

	public constructor (private readonly text: string) {
		super();
	}

	public isInline () {
		return true;
	}

	public compile () {
		return this.text;
	}
}
