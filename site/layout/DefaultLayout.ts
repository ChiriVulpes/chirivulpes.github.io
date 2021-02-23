import Page from "../utilities/Page";

export default class DefaultLayout extends Page {
	public constructor () {
		super();
		this.requireStyles("index");
	}
}
