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
	protected appendsTo: Element = this;
	private _parent?: Element;
	public get parent () { return this._parent; }
	public requiredStylesheets?: string[] = [];

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

	public requireStyles (...files: string[]) {
		this.requiredStylesheets ??= [];
		this.requiredStylesheets?.push(...files);
		return this;
	}

	public append (...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.push(...children as Node[]);
		for (const child of children)
			(child as Element)._parent = this;
		return this;
	}

	public appendTo (element: Element) {
		element.append(this);
		return this;
	}

	public prepend (...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.unshift(...children as Node[]);
		for (const child of children)
			(child as Element)._parent = this;
		return this;
	}

	public prependTo (element: Element) {
		element.prepend(this);
		return this;
	}

	public insert (at: number, ...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.splice(at, 0, ...children as Node[]);
		for (const child of children)
			(child as Element)._parent = this;
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

	public find<NODE extends Node> (predicate: (node: Node) => node is NODE): NODE | undefined;
	public find (predicate: (node: Node) => any): Node | undefined;
	public find (predicate: (node: Node) => any) {
		for (const child of this.children) {
			if (predicate(child))
				return child;

			if (child instanceof Element) {
				const found = child.find(predicate);
				if (found)
					return found;
			}
		}

		return undefined;
	}

	public findAll<NODE extends Node> (predicate: (node: Node) => node is NODE): NODE[];
	public findAll (predicate: (node: Node) => any): Node[];
	public findAll (predicate: (node: Node) => any) {
		let result: Node[] = [];
		for (const child of this.children) {
			if (predicate(child))
				result.push(child);

			else if (child instanceof Element)
				result.push(...child.findAll(predicate));
		}

		return result;
	}

	public findElement<ELEMENT extends Element> (predicate: (node: Element) => node is ELEMENT): ELEMENT | undefined;
	public findElement (predicate: (node: Element) => any): Element | undefined;
	public findElement (predicate: (node: Element) => any) {
		for (const child of this.children) {
			if (!(child instanceof Element))
				continue;

			if (predicate(child))
				return child;

			if (child instanceof Element) {
				const found = child.findElement(predicate);
				if (found)
					return found;
			}
		}

		return undefined;
	}

	public findAllElements<ELEMENT extends Element> (predicate: (element: Element) => element is ELEMENT): ELEMENT[];
	public findAllElements (predicate: (element: Element) => any): Element[];
	public findAllElements (predicate: (element: Element) => any) {
		let result: Element[] = [];
		for (const child of this.children) {
			if (!(child instanceof Element))
				continue;

			if (predicate(child))
				result.push(child);

			else if (child instanceof Element)
				result.push(...child.findAllElements(predicate));
		}

		return result;
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
