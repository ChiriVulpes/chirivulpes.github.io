import Element, { Initialiser } from "@element/Element";

export default class Masonry extends Element {

	public constructor () {
		super("div");
		this.class("masonry");
		this.requireStyles("layout/masonry");
	}

	/**
	 * Initialises a new column.
	 */
	public column (initialiser: Initialiser<Column>): this;
	/**
	 * Runs an initialiser on an existing column, of the given ID.
	 * Note: Internally, there are no checks to verify that the 
	 */
	public column (column: number, initialiser: Initialiser<Column>): this;
	public column (columnOrInitialiser?: number | Initialiser<Column>, initialiser?: Initialiser<Column>) {
		if (typeof columnOrInitialiser !== "number")
			initialiser = columnOrInitialiser, columnOrInitialiser = undefined;

		const column = columnOrInitialiser === undefined ? new Column().appendTo(this) : this.children[columnOrInitialiser];
		initialiser!(column as Column);
		return this;
	}

	public precompile () {
		let templateColumns = "";
		for (const child of this.children)
			if (child instanceof Column)
				templateColumns += ` ${child.fractionWidth}fr`;
			else
				this.getLog().warn("Masonry contains non-column", child.getId());

		this.style("grid-template-columns", templateColumns.slice(1));
	}
}

export class Column extends Element {

	public constructor () {
		super("aside");
	}

	public fractionWidth = 1;

	/**
	 * By default, all columns have a fraction width of `1`. If you set this column to `2`, for example, 
	 * it will be twice the size of columns with a fraction width of `1`.
	 */
	public setFractionWidth (width: number) {
		this.fractionWidth = width;
		return this;
	}

}
