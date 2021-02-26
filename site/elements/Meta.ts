import Element, { Fragment } from "@element/Element";
import { Variadic } from "@util/Arrays";
import { Flatten } from "@util/Objects";
import { DateISO, HrefAbsolute, HrefFile } from "@util/Strings";

class Meta extends Element {
	public constructor (type: "meta" | "link") {
		super(type);
	}
}

namespace Meta {

	class MetaMeta extends Meta {
		public constructor (subType: string, subTypeAttribute = "name") {
			super("meta");
			this.attribute(subTypeAttribute, subType);
		}
	}

	export class Description extends MetaMeta {
		public constructor (description: string) {
			super("description");
			this.attribute("content", description);
		}
	}

	type ViewportPropertyWidth = `width=${number | "device-width"}`;
	type ViewportPropertyInitialScale = `initial-scale=${number}`;
	type ViewportPropertyMinimumScale = `minimum-scale=${number}`;
	type ViewportPropertyMaximumScale = `maximum-scale=${number}`;
	type ViewportPropertyNotUserScalable = "user-scalable=no";

	type ViewportProperty = ViewportPropertyWidth
		| ViewportPropertyInitialScale
		| ViewportPropertyMinimumScale
		| ViewportPropertyMaximumScale
		| ViewportPropertyNotUserScalable;

	export class Viewport extends MetaMeta {
		public constructor (...settings: ViewportProperty[]) {
			super("viewport");
			this.attribute("content", settings.join(", "));
		}
	}

	export type OpenGraphType = "website" | "article" | "book" | "profile" | `music.${OpenGraphMusicType}` | `video.${OpenGraphVideoType}`;
	type OpenGraphMusicType = "song" | "album" | "playlist" | "radio_station";
	type OpenGraphVideoType = "movie" | "episode" | "tv_show" | "other"

	type OpenGraphProperties = Flatten<{
		type: OpenGraphType;
		title: string;
		description: string;
		image: HrefAbsolute;
		url: HrefAbsolute;
		article: {
			published_time: DateISO;
			tag: string[];
			author: string;
		};
	}, ":">;

	export class OpenGraph<PROPERTY extends keyof OpenGraphProperties> extends Fragment {
		public constructor (property: PROPERTY, ...values: Variadic<OpenGraphProperties[PROPERTY]>) {
			super();
			for (const value of values)
				new MetaMeta(`og:${property}`, "property")
					.attribute("content", value)
					.appendTo(this);
		}
	}

	class MetaLink extends Meta {
		public constructor (subType: string, href: HrefFile) {
			super("link");
			this.attribute("rel", subType);
			this.attribute("href", href);
		}
	}

	export class SiteIcon extends MetaLink {
		public constructor (href: HrefFile) {
			super("shortcut icon", href);
		}
	}

	export class Preconnect extends MetaLink {
		public constructor (href: HrefFile) {
			super("preconnect", href);
		}
	}
}

export default Meta;
