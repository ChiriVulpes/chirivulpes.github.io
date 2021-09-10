import { IHasCard } from "@element/Article";
import Card from "@element/Card";
import Element, { Initialiser } from "@element/Element";
import Image from "@element/Image";
import Thumbnail from "@element/Thumbnail";
import Bound from "@util/decorator/Bound";
import Log from "@util/Log";
import { HrefAbsolute } from "@util/string/Strings";
import ansi from "ansicolor";

enum Type {
	Games,
	Websites,
	"Utilities, Other",
}

export type ProjectType = keyof typeof Type;

export default class Project implements IHasCard {

	public constructor (public title: string) {
	}

	////////////////////////////////////
	// Status
	//

	private _type?: ProjectType;
	public get type (): ProjectType {
		if (this._type !== undefined)
			return this._type;

		Log.error("Project", this.getID(), "missing type");
		return "Utilities, Other";
	}

	public setType (type: ProjectType) {
		this._type = type;
		return this;
	}

	////////////////////////////////////
	// Description
	//

	public description?: string;
	public setDescription (description: string) {
		this.description = description;
		return this;
	}

	////////////////////////////////////
	// Image
	//

	public image?: string;
	public setImage (image: string) {
		this.image = image;
		return this;
	}

	////////////////////////////////////
	// Link
	//

	private _link?: HrefAbsolute;
	public get link () {
		if (this._link !== undefined)
			return this._link;

		Log.error("Project", this.getID(), "missing link");
		return "/";
	}

	public setLink (link: HrefAbsolute) {
		this._link = link;
		return this;
	}

	////////////////////////////////////
	// Price
	//

	public price?: number;
	public currency?: string;
	public setPrice (price: number, currency?: string) {
		this.price = price;
		if (currency !== undefined)
			this.currency = currency;
		return this;
	}

	////////////////////////////////////
	// Details
	//

	public details?: Initialiser<Element>;
	public setDetails (initialiser: Initialiser<Element>) {
		this.details = initialiser;
		return this;
	}

	////////////////////////////////////
	// Card
	//

	public createCard () {
		return new Card(this.title, this.link)
			.class("project")
			.setImage(!this.image ? undefined
				: this.image.startsWith("https://") ? new Image(this.image as HrefAbsolute)
					: new Thumbnail(`cover/${this.image}`, 200))
			.details(this.createCardDetails)
			.markdown(this.description);
	}

	public getOrder () {
		return [0];
	}

	@Bound private createCardDetails (details: Element) {
		this.details?.(details);
	}

	private getID () {
		return ansi.red(this.title);
	}
}
