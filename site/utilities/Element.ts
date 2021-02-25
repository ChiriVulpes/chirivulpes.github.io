import ansi from "ansicolor";
import Log from "../../shared/utilities/Log";

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


////////////////////////////////////
// Node
//

export abstract class Node {
	abstract isInline (): boolean;
	abstract compile (indent?: boolean): string | Promise<string>;

	public appendTo (container: NodeContainer) {
		container.append(this);
		return this;
	}

	public prependTo (container: NodeContainer) {
		container.prepend(this);
		return this;
	}

	public insertTo (container: NodeContainer, at: number) {
		container.insert(at, this);
		return this;
	}
}

type UnresolvedChild = Node | ((element: Element) => Node);
function resolveChild (child: UnresolvedChild) {
	return typeof child === "function" ? child(new Element()) : child;
}


////////////////////////////////////
// Node container
//

export abstract class NodeContainer extends Node {

	public readonly children: Node[] = [];

	protected appendsTo: NodeContainer = this;
	private _parent?: NodeContainer;

	public get parent () { return this._parent; }
	public get root () {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let element: NodeContainer = this;
		while (element._parent !== undefined)
			element = element._parent;
		return element;
	}

	public append (...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.push(...children as Node[]);
		for (const child of children)
			(child as NodeContainer)._parent = this;
		return this;
	}

	public prepend (...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.unshift(...children as Node[]);
		for (const child of children)
			(child as NodeContainer)._parent = this;
		return this;
	}

	public insert (at: number, ...children: UnresolvedChild[]) {
		children = children.map(resolveChild);
		this.appendsTo.children.splice(at, 0, ...children as Node[]);
		for (const child of children)
			(child as NodeContainer)._parent = this;
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
		const result: Node[] = [];
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
		const result: Element[] = [];
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
}

export class Fragment extends NodeContainer {
	public isInline () {
		return this.children.every(node => node.isInline());
	}

	public async compile (indent: boolean) {
		const compiledChildren = await Promise.all(this.children
			.map(element => element.compile(indent)));

		return compiledChildren.join(indent ? "\n" : "");
	}
}


////////////////////////////////////
// Element
//

export default class Element extends NodeContainer {

	private classes: string[] = [];
	private _attributes: Record<string, string> = {};
	private _isInline?: boolean;
	public requiredStylesheets?: string[] = [];
	private requiresText?: true;
	private noElementChildren?: true;

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

	public setDoesNotSupportElementChildren () {
		this.noElementChildren = true;
		return this;
	}

	public requireStyles (...files: string[]) {
		this.requiredStylesheets ??= [];
		this.requiredStylesheets?.push(...files);
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
		this._attributes[name] = value;
		return this;
	}

	public attributes (source: Element) {
		for (const [name, value] of Object.entries(source._attributes))
			this._attributes[name] = value;
		return this;
	}

	public setTextRequired () {
		this.requiresText = true;
		return this;
	}

	public text (text: string) {
		this.append(new Text(text));
		return this;
	}

	public precompile?(indent: boolean): any;

	public async compile (indent: boolean) {
		const type = this.type;
		const isVoid = voidElements.has(type);
		const postTag = isVoid ? "" : `</${type}>`;

		const classes = this.classes.length === 0 ? "" : ` class="${this.classes.join(" ")}"`;
		const attributes = Object.entries(this._attributes)
			.map(([name, value]) => ` ${name}="${value}"`)
			.join("");

		return `<${type}${classes}${attributes}${isVoid ? "/" : ""}>${await this.compileChildren(indent, isVoid) ?? ""}${postTag}`
	}

	protected async compileChildren (indent: boolean, isVoid: boolean) {
		const childElements = this.children;
		let requiresTextChild = this.requiresText === true;

		if (childElements.length === 0) {
			if (requiresTextChild)
				this.getLog().error(this.getId(), "should contain text");
			return undefined;
		}

		if (isVoid) {
			this.getLog().error(this.getId(), "is a void element and cannot contain children");
			return undefined;
		}

		const noElementChildren = this.noElementChildren === true;

		let childrenAllowIndent = true;
		const compiledChildren = await Promise.all(childElements.map(element => {
			if (element.isInline())
				childrenAllowIndent = false;

			if (noElementChildren && element instanceof Element) {
				this.getLog().error(this.getId(), "cannot contain child element", element.getId());
				return undefined;
			}

			if (requiresTextChild && element instanceof Text)
				requiresTextChild = false;

			return element.compile(indent);
		}));

		if (requiresTextChild)
			this.getLog().error(this.getId(), "should contain text");

		const actuallyIndent = indent && childrenAllowIndent;

		const newline = actuallyIndent ? "\n" : "";
		let contents = "";
		for (const compiledChild of compiledChildren)
			if (compiledChild !== undefined)
				contents += newline + compiledChild;

		return `${actuallyIndent ? contents.indent(false) : contents}${newline}`;
	}

	protected getLog () {
		return Log.get(this.root);
	}

	private getId () {
		return ansi.green(`${this.constructor.name}<${this.type}>`);
	}
}


////////////////////////////////////
// Text
//

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
