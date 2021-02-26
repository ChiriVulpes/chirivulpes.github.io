export type Href = HrefLocal | HrefAbsolute;
export type HrefAbsolute = `https://${string}`;
export type HrefLocal = `/${string}`;

export type DateISO = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;
