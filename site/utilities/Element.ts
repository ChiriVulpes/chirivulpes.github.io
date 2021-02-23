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
	abstract compile (indent?: boolean): string | Promise<string>;
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
	protected appendsTo = this.children;

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
		this.appendsTo.push(...children.map(resolveChild));
		return this;
	}

	public appendTo (element: Element) {
		element.append(this);
		return this;
	}

	public prepend (...children: UnresolvedChild[]) {
		this.appendsTo.unshift(...children.map(resolveChild));
		return this;
	}

	public prependTo (element: Element) {
		element.prepend(this);
		return this;
	}

	public insert (at: number, ...children: UnresolvedChild[]) {
		this.appendsTo.splice(at, 0, ...children.map(resolveChild));
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

	public async compile (indent = false) {
		const type = this.type;
		const isVoid = voidElements.has(type);
		let postTag = isVoid ? "" : `</${type}>`;

		const classes = this.classes.length === 0 ? "" : ` class="${this.classes.join(" ")}"`;
		const attributes = Object.entries(this.attributes)
			.map(([name, value]) => ` ${name}="${value}"`)
			.join("");

		return `<${type}${classes}${attributes}${isVoid ? "/" : ""}>${await this.compileChildren(indent, isVoid) ?? ""}${postTag}`
	}

	protected async compileChildren (indent: boolean, isVoid: boolean) {
		const childElements = this.children;
		if (childElements.length === 0)
			return undefined;

		if (isVoid)
			throw new Error(`Void element "${this.type}" cannot have children`);

		let childrenAllowIndent = true;
		const compiledChildren = await Promise.all(childElements.map(element => {
			if (element.isInline())
				childrenAllowIndent = false;
			return element.compile(indent);
		}));

		const actuallyIndent = indent && childrenAllowIndent;

		const newline = actuallyIndent ? "\n" : "";
		const contents = compiledChildren.join(newline);

		return `${newline}${actuallyIndent ? contents.indent() : contents}${newline}`;
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
