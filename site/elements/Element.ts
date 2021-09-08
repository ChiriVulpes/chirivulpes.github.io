import Log from "@util/Log";
import { compileMarkdown, HrefLocal } from "@util/Strings";
import ansi from "ansicolor";
import fs from "fs-extra";

export type Initialiser<T> = (thing: T) => any;

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
	abstract compile (indent: boolean): string | Promise<string>;
	abstract getId (): string;

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

	public precompile?(indent: boolean): void;

	private _parent?: NodeContainer;

	public get parent () { return this._parent; }
	public get root (): NodeContainer {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let element: Node = this;
		while (element._parent !== undefined)
			element = element._parent;
		return element as NodeContainer;
	}

	protected getLog () {
		return Log.get(this.root);
	}
}


////////////////////////////////////
// Node container
//

export abstract class NodeContainer extends Node {

	public readonly children: Node[] = [];

	protected appendsTo: NodeContainer = this;

	public append (...children: Node[]) {
		this.appendsTo.children.push(...children);
		for (const child of children)
			child["_parent"] = this;
		return this;
	}

	public prepend (...children: Node[]) {
		this.appendsTo.children.unshift(...children);
		for (const child of children)
			child["_parent"] = this;
		return this;
	}

	public insert (at: number, ...children: Node[]) {
		this.appendsTo.children.splice(at, 0, ...children);
		for (const child of children)
			child["_parent"] = this;
		return this;
	}

	public text (text: string) {
		return this.append(new Text(text));
	}

	public markdown (markdown?: string) {
		if (markdown !== undefined)
			new Markdown(markdown).appendTo(this);
		return this;
	}

	public html (html?: string) {
		if (html !== undefined)
			new HTML(html).appendTo(this);
		return this;
	}

	public dump () {
		this.children.splice(0, Infinity);
		return this;
	}

	public find<NODE extends Node> (predicate: (node: Node) => node is NODE): NODE | undefined;
	public find (predicate: (node: Node) => any): Node | undefined;
	public find (predicate: (node: Node) => any) {
		for (const child of this.children) {
			if (predicate(child))
				return child;

			if (child instanceof NodeContainer) {
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

			if (child instanceof NodeContainer)
				result.push(...child.findAll(predicate));
		}

		return result;
	}

	public findElement<ELEMENT extends Element> (predicate: (node: Element) => node is ELEMENT): ELEMENT | undefined;
	public findElement (predicate: (node: Element) => any): Element | undefined;
	public findElement (predicate: (node: Element) => any) {
		for (const child of this.children) {
			if (child instanceof Element && predicate(child))
				return child;

			if (child instanceof NodeContainer) {
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
			if (child instanceof Element && predicate(child))
				result.push(child);

			if (child instanceof NodeContainer)
				result.push(...child.findAllElements(predicate));
		}

		return result;
	}

	public async precompileDescendants (indent: boolean) {
		for (const child of this.children) {
			if (child.precompile !== undefined)
				await child.precompile(indent);

			if (child instanceof NodeContainer)
				await child.precompileDescendants(indent);
		}
	}
}

export class Fragment extends NodeContainer {
	public isInline () {
		return this.children.every(node => node.isInline());
	}

	public async compile (indent: boolean) {
		const compiledChildren = await Promise.all(this.children
			.map(element => element.compile(indent)));

		const newline = indent ? "\n" : "";
		let result = "";
		for (const child of compiledChildren)
			if (child.length > 0)
				result += newline + child;
		return indent ? result.slice(1) : result;
	}

	public getId () {
		return ansi.green("Fragment");
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
	public requiredScripts?: string[] = [];
	private requiresText?: true;
	private isFlat?: true;
	private _style?: Record<string, string>;
	private onlyRenderWithContent?: true;

	public constructor (public type = "div") {
		super();
	}

	public setType (type: string) {
		this.type = type;
		return this;
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

	/**
	 * Sets this element as unable to have descendants
	 */
	public setFlat () {
		this.isFlat = true;
		return this;
	}

	public setAriaHidden () {
		this.attribute("aria-hidden", "true");
		return this;
	}

	public setAriaLabel (label: string) {
		this.attribute("aria-label", label);
		return this;
	}

	public requireStyles (...files: string[]) {
		this.requiredStylesheets ??= [];
		this.requiredStylesheets?.push(...files);
		return this;
	}

	public requireScripts (...files: string[]) {
		this.requiredScripts ??= [];
		this.requiredScripts?.push(...files);
		return this;
	}

	public id (id?: string) {
		if (id !== undefined)
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

	public style (rule: string, value: string) {
		if (this._style === undefined)
			this._style = {};

		this._style[rule] = value;
		return this;
	}

	public setTextRequired () {
		this.requiresText = true;
		return this;
	}

	public setOnlyRenderWithContent () {
		this.onlyRenderWithContent = true;
		return this;
	}

	public async compile (indent: boolean) {
		const type = this.type;
		const isVoid = voidElements.has(type);
		const postTag = isVoid ? "" : `</${type}>`;

		const classes = this.classes.length === 0 ? "" : ` class="${this.classes.join(" ")}"`;
		const attributes = Object.entries(this._attributes)
			.map(([name, value]) => ` ${name}="${value}"`)
			.join("");

		const style = this._style === undefined ? "" : ' style="' + Object.entries(this._style)
			.map(([property, value]) => `${property}:${value}`)
			.join(";") + '"';

		const children = await this.compileChildren(indent, isVoid) ?? "";
		if (this.onlyRenderWithContent === true && children.length === 0)
			return "";

		return `<${type}${classes}${attributes}${style}${isVoid ? "/" : ""}>${children}${postTag}`
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

		const isFlat = this.isFlat === true;

		let childrenAllowIndent = true;
		const compiledChildren = await Promise.all(childElements.map(element => {
			if (element.isInline())
				childrenAllowIndent = false;

			if (isFlat && element instanceof NodeContainer) {
				this.getLog().error(this.getId(), "cannot contain node container", element.getId());
				return "";
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
			if (compiledChild.length > 0)
				contents += newline + compiledChild;

		return `${actuallyIndent ? contents.indent(false) : contents}${newline}`;
	}

	public getId () {
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

	private id?: string;
	public getId () {
		const id = this.id;
		if (id !== undefined)
			return id;

		const text = this.text;
		return this.id = ansi.green(`Text(${text.length > 20 ? text.slice(0, 20) + "..." : text})`);
	}
}

export class HTML extends Node {

	public static fromFile (file: HrefLocal) {
		return new HTMLFile(file);
	}

	public constructor (protected html: string) {
		super();
	}

	public isInline () {
		return false;
	}

	public compile () {
		return this.html;
	}

	private id?: string;
	public getId () {
		const id = this.id;
		if (id !== undefined)
			return id;

		const html = this.html;
		return this.id = ansi.green(`HTML(${html.length > 20 ? html.slice(0, 20) + "..." : html})`);
	}
}

class HTMLFile extends HTML {
	public constructor (private readonly file: HrefLocal) {
		super("");
	}

	public async precompile () {
		this.html = await fs.readFile(`${process.cwd()}${this.file}`, "utf8");
	}
}

export class Markdown extends Node {

	private text?: string;
	public constructor (private readonly markdown: string) {
		super();
	}

	public isInline () {
		return false;
	}

	public async precompile (shouldIndent: boolean) {
		const markdown = await compileMarkdown(this.markdown)
			.catch(err => this.getLog().warn("Unable to render markdown", this.getId(), err));
		this.text = markdown ?? "";
	}

	public compile () {
		const text = this.text;
		if (text === undefined)
			this.getLog().error("No compiled markdown text to render", this.getId());
		return text ?? "";
	}

	private id?: string;
	public getId () {
		const id = this.id;
		if (id !== undefined)
			return id;

		const markdown = this.markdown;
		return this.id = ansi.green(`Markdown(${markdown.length > 20 ? markdown.slice(0, 20) + "..." : markdown})`);
	}
}
