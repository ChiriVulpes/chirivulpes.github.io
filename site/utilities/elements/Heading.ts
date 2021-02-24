import Element from "../Element";

const headingLevelsByRoot = new Map<Element, Set<number>>();

export default class Heading extends Element {
	public constructor (public readonly level: 1 | 2 | 3 | 4 | 5 | 6) {
		super(`h${level}`);
	}

	/**
	 * Automatically prevents heading level-skipping
	 */
	public precompile () {
		const root = this.root;
		let headingLevels = headingLevelsByRoot.get(root);
		if (!headingLevels) {
			headingLevels = new Set(root.findAllElements((element): element is Heading => element instanceof Heading)
				.map(heading => heading.level));
			headingLevelsByRoot.set(root, headingLevels);
		}

		let level = this.level;
		for (let i = 1; i < this.level; i++)
			if (!headingLevels.has(i))
				level--;

		this.type = `h${level}`;
	}
}
