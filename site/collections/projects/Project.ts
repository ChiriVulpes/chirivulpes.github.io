import { IHasCard } from "@element/Article";
import Card from "@element/Card";
import Element, { Initialiser, NodeContainer } from "@element/Element";
import Image from "@element/Image";
import Thumbnail from "@element/Thumbnail";
import Bound from "@util/decorator/Bound";
import Log from "@util/Log";
import { HrefAbsolute, HrefLocal } from "@util/string/Strings";
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
	public imageInitialiser?: Initialiser<Image>;
	public setImage (image: string, initialiser?: Initialiser<Image>) {
		this.image = image;
		this.imageInitialiser = initialiser;
		return this;
	}

	////////////////////////////////////
	// Link
	//

	private _link?: HrefAbsolute | HrefLocal;
	public get link () {
		if (this._link !== undefined)
			return this._link;

		Log.error("Project", this.getID(), "missing link");
		return "/";
	}

	public setLink (link: HrefAbsolute | HrefLocal) {
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

	private cardInitialiser?: Initialiser<Card>;
	public setCardInitialiser (initialiser: Initialiser<Card>) {
		this.cardInitialiser = initialiser;
		return this;
	}

	public createCard (into?: NodeContainer) {
		const image = !this.image ? undefined
			: this.image.startsWith("https://") ? new Image(this.image as HrefAbsolute)
				: new Thumbnail(this.image, 200);
		image?.attribute("alt", `${this.title} cover image`);
		if (image && this.imageInitialiser)
			this.imageInitialiser(image);

		const card = new Card(this.title, this.link)
			.class("project")
			.setImage(image)
			.details(this.createCardDetails)
			.markdown(this.description);

		if (into)
			into.append(card);

		this.cardInitialiser?.(card);
		return card;
	}

	private order?: number;
	public setOrder (order: number) {
		this.order = order;
		return this;
	}

	public getOrder () {
		return [this.order ?? 0];
	}

	public associatedTag?: string;
	public setAssociatedTag (tag: string) {
		this.associatedTag = tag;
		return this;
	}

	@Bound private createCardDetails (details: Element) {
		this.details?.(details);
	}

	private getID () {
		return ansi.red(this.title);
	}
}
