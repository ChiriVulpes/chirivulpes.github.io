import Element, { NodeContainer } from "@element/Element";

const headingLevelsByRoot = new Map<NodeContainer, Set<number>>();

export default class Heading extends Element {
	public constructor (public readonly level: 1 | 2 | 3 | 4 | 5 | 6) {
		super(`h${level}`);
		this.class("heading", `heading${level}`);
	}

	/**
	 * Automatically prevents heading level-skipping
	 */
	public precompile () {
		let level = this.level;
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
