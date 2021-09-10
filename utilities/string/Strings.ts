export type HrefFile = HrefLocal | HrefAbsolute;
export type Href = HrefLocal | HrefAbsolute | HrefHash;
export type HrefAbsolute = `https://${string}`;
export type HrefLocal = `/${string}`;
export type HrefHash = `#${string}`;

export type DateISO = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

export function createID (text: string) {
	return text.replace(/\W+/g, "-").toLowerCase();
}
