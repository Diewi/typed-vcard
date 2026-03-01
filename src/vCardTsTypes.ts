export type vCardProperty = {
    params: { [key: string]: string | string[] };
    type?: string[];
    tag?: TypeTag,
    preferenceIdx?: number,
    valueType?: ValueType,
    value: string | string[];
}

export enum TypeTag {
    WORK = "work",
    HOME = "home"
}

export enum ValueType {
    TEXT = "text",
    URI = "uri",
    DATE = "date",
    TIME = "time",
    DATE_TIME = "date-time",
    DATE_AND_OR_TIME = "date-and-or-time",
    TIMESTAMP = "timestamp",
    BOOLEAN = "boolean",
    INTEGER = "integer",
    FLOAT = "float",
    UTC_OFFSET = "utc-offset",
    LANGUAGE_TAG = "language-tag"
}

export enum MailType {
    internet = "internet",
    x400 = "x400"
}

export type MediaType = {
    type: string
    subType?: string
    params?: {[key: string]: string}
}

export type GeoCoordinates = vCardProperty & {
    latitude: number
    longitude: number
}

export type eMail = vCardProperty & {
    addressType?: MailType
}

export type gender = vCardProperty & {
    sex?: string
    indentity?: string
}

export type impp = vCardProperty & {
    valueType?: ValueType.URI
    mediaType?: MediaType
}

export type key = vCardProperty & {
    keyUri?: valueUri
}

export type address = vCardProperty & {
    poBox?: string;
    extendedAddress?: string;
    street?: string;
    locality?: string; // city
    region?: string;
    postalCode?: string;
    country?: string;
    label?: string;
    // a formatted full address string (may be present in value)
    fullAddress?: string;
}

export type name = vCardProperty & {
    locale?: string
    familyName?: string
    givenName?: string
    additionalName?: string
    honorificPrefix?: string
    honorificSuffix?: string
}

export type organization = vCardProperty & {
    organizationName: string
    organizationUnit?: string[]
}

export type photo = vCardProperty & {
    mediaType?: MediaType
    encoding?: string
}

export type related = vCardProperty & {
    relatedType?: relatedType
    relatedUri?: string
    relatedText?: string
}

export enum relatedType {
    CONTACT = "contact",
    ACQUAINTANCE = "acquaintance",
    FRIEND = "friend",
    MET = "met",
    CO_WORKER = "co-worker",
    COLLEAGUE = "colleague",
    CO_RESIDENT = "co-resident",
    NEIGHBOR = "neighbor",
    CHILD = "child",
    PARENT = "parent",
    SIBLING = "sibling",
    SPOUSE = "spouse",
    KIN = "kin",
    MUSE = "muse",
    CRUSH = "crush",
    DATE = "date",
    SWEETHEART = "sweetheart",
    ME = "me",
    AGENT = "agent",
    EMERGENCY = "emergency",
}

export type valueUri = {
    uri: string
    mediatype?: MediaType
}

export type telepone = vCardProperty & {
    valueType: ValueType.URI | ValueType.TEXT
    valueUri?: valueUri
    device?: phoneDevice
    capabilities: phoneCapabilities[]
}

export type url = vCardProperty & {
    url?: URL
}


export enum phoneDevice {
    TEL = "tel",
    CELL = "cell",
    FAX = "fax",
    PAGER = "pager",
    TEXTPHONE = "textphone"
}
export type phoneDeviceUnion =
    phoneDevice.TEL |
    phoneDevice.CELL |
    phoneDevice.FAX |
    phoneDevice.PAGER |
    phoneDevice.TEXTPHONE;

export enum phoneCapabilities {
    VOICE = "voice",
    VIDEO = "video",
    TEXT = "text"
}

export type phoneCapabilitiesUnion =
    phoneCapabilities.VOICE |
    phoneCapabilities.VIDEO |
    phoneCapabilities.TEXT;

export class vCardTsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "vCardTsError";
    }
}
