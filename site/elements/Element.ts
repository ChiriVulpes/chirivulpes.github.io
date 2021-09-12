import Log from "@util/Log";
import Markdown from "@util/string/Markdown";
import { HrefLocal } from "@util/string/Strings";
import ansi from "ansicolor";
import fs from "fs-extra";

export type Initialiser<T, A extends any[] = []> = (thing: T, ...args: A) => any;

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

	protected precompile?(indent: boolean): void;
	protected abstract compile (indent: boolean): string | Promise<string>;

	private precompiled?: Promise<void>;
	public doPrecompile (indent: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
		this.precompiled ??= new Promise<void>(async resolve => {
			await this.precompile?.(indent);
			resolve();
		});

		return this.precompiled;
	}

	private compiled?: Promise<string>;
	public async doCompile (indent: boolean) {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
		this.compiled ??= new Promise<string>(async resolve => {
			resolve(await this.compile(indent));
		});

		return this.compiled;
	}

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

	public init<A extends any[]> (initialiser?: Initialiser<this, A>, ...args: A) {
		initialiser?.(this, ...args);
		return this;
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

	public insertAfter (node: Node, ...children: Node[]) {
		const index = this.children.indexOf(node);
		if (index === -1)
			return this.append(...children);
		return this.insert(index + 1, ...children);
	}

	public text (text: string, cdata = false) {
		return this.append(new Text(text)
			.setCDATA(cdata));
	}

	public markdown (markdown?: string) {
		if (markdown !== undefined)
			new MarkdownFragment(markdown).appendTo(this);
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
			await child.doPrecompile(indent);

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
			.map(element => element.doCompile(indent)));

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

	protected readonly classes = new Set<string>();
	protected _attributes: Record<string, string> = {};
	private _isInline?: boolean;
	public requiredStylesheets?: string[] = [];
	public requiredScripts?: string[] = [];
	private requiresText?: true;
	private isFlat?: true;
	private _style?: Record<string, string>;
	private onlyRenderWithContent?: true;
	private noWrap?: true;

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
		for (const cls of classes)
			this.classes.add(cls);
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

	public getAttribute (name: string): string | undefined {
		return this._attributes[name];
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

	public setContentsOnly () {
		this.noWrap = true;
		return this;
	}

	protected async compile (indent: boolean) {
		const type = this.type;
		const isVoid = voidElements.has(type);
		const children = await this.compileChildren(indent && !this.noWrap, isVoid) ?? "";
		if (this.onlyRenderWithContent === true && children.length === 0)
			return "";

		if (this.noWrap)
			return children;

		const postTag = isVoid ? "" : `</${type}>`;

		const classes = this.classes.size === 0 ? "" : ` class="${[...this.classes].join(" ")}"`;
		const attributes = Object.entries(this._attributes)
			.map(([name, value]) => ` ${name}="${value.replace(/"/g, "&quot;")}"`)
			.join("");

		const style = this._style === undefined ? "" : ' style="' + Object.entries(this._style)
			.map(([property, value]) => `${property}:${value}`)
			.join(";") + '"';

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

			return element.doCompile(indent);
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

	private cdata?: boolean;
	public setCDATA (cdata?: boolean) {
		this.cdata = cdata ?? true;
		return this;
	}

	public isInline () {
		return true;
	}

	protected compile () {
		return this.cdata ? `<![CDATA[${this.text}]]>` : this.text;
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

	public constructor (protected html: string) {
		super();
	}

	public isInline () {
		return false;
	}

	protected compile () {
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

export class FileFragment extends Fragment {
	private fileText?: string;
	public constructor (private readonly file: HrefLocal) {
		super();
	}

	private _onPrecompile?: (text: string, element: FileFragment) => any;
	public onPrecompile (onPrecompile: (text: string, element: FileFragment) => any) {
		this._onPrecompile = onPrecompile;
		return this;
	}

	public async precompile () {
		this.fileText = await fs.readFile(`${process.cwd()}${this.file}`, "utf8").catch(() => "");
		if (!this._onPrecompile) {
			this.text(this.fileText);
			return;
		}

		this._onPrecompile(this.fileText, this);
	}
}

const headingLevelsByRoot = new Map<NodeContainer, Set<number>>();

export class Heading extends Element {
	public constructor (public readonly level: 1 | 2 | 3 | 4 | 5 | 6) {
		super(`h${level}`);
		this.class("heading", `heading${level}`);
		this.actualLevel = level;
	}

	private actualLevel: number;
	public setActualLevel (level: 1 | 2 | 3 | 4 | 5 | 6) {
		this.actualLevel = level;
		this.type = `h${level}`;
		return this;
	}

	/**
	 * Automatically prevents heading level-skipping
	 */
	protected precompile () {
		let level = this.actualLevel;
		if (this.hasCustomType())
			// ignore headings of different tag types
			return;

		const root = this.root;
		let headingLevels = headingLevelsByRoot.get(root);
		if (!headingLevels) {
			headingLevels = new Set(root.findAll((element): element is Heading => element instanceof Heading)
				.filter(element => !element.hasCustomType())
				.map(heading => heading.level));
			headingLevelsByRoot.set(root, headingLevels);
		}

		for (let i = 1; i < this.level; i++)
			if (!headingLevels.has(i))
				level--;

		this.type = `h${level}`;
	}

	private hasCustomType () {
		return this.type !== `h${this.level}`;
	}
}

const REGEX_HEADING = /^<h([123456])\b(?:\s+id="([^"]*?)")?\s*>(.*)<\/h[123456]>$/;
export class MarkdownFragment extends Fragment {

	public constructor (private readonly _markdown: string) {
		super();
	}

	public isInline () {
		return false;
	}

	protected async precompile (shouldIndent: boolean) {
		const markdown = await Markdown.compile(this._markdown)
			.catch(err => this.getLog().warn("Unable to render markdown", this.getId(), err));

		this.append(...this.explode(markdown ?? ""));
	}

	private explode (markdown: string) {
		const contents: Node[] = [];
		let html = "";
		NextTop: for (let i = 0; i < markdown.length; i++) {
			if (markdown[i] !== "<" || markdown[i + 1] !== "h" || (markdown[i + 3] !== " " && markdown[i + 3] !== ">")) {
				html += markdown[i];
				continue;
			}

			const level = +markdown[i + 2];
			if (!(level > 0 && level < 7)) {
				html += markdown[i];
				continue;
			}

			if (html.length)
				contents.push(new HTML(html));
			html = "";

			for (let j = i + 3; j < markdown.length; j++) {
				if (markdown[j] !== "<" || markdown[j + 1] !== "/" || markdown[j + 2] !== "h" || markdown[j + 3] !== `${level}` || markdown[j + 4] !== ">")
					continue;

				j += 5;

				const match = REGEX_HEADING.exec(markdown.slice(i, j));
				if (!match)
					continue NextTop;

				const nextContents = this.explode(markdown.slice(j));
				let indexOfNextSection = nextContents.findIndex(element => element instanceof Element
					&& element.type === "section"
					&& (element.children[0] as Heading).level <= level);
				if (indexOfNextSection === -1)
					indexOfNextSection = Infinity;

				const [_, , id, text] = match;
				contents.push(new Element("section")
					.append(new Heading(+level as 1 | 2 | 3 | 4 | 5 | 6)
						.id(id)
						.html(text))
					.append(...nextContents.slice(0, indexOfNextSection)));
				contents.push(...nextContents.slice(indexOfNextSection));

				break NextTop;
			}
		}

		if (html.length)
			contents.push(new HTML(html));

		return contents;
	}

	private id?: string;
	public getId () {
		const id = this.id;
		if (id !== undefined)
			return id;

		const markdown = this._markdown;
		return this.id = ansi.green(`Markdown(${markdown.length > 20 ? markdown.slice(0, 20) + "..." : markdown})`);
	}
}
