import { eMail, GeoCoordinates, name, organization, photo, telepone, url, vCardProperty, address, key } from './vCardTsTypes';

export interface vCardTsCommon {

    // Structured address entries (ADR). Contains components when available
    readonly addresses?: address[];

    readonly birthdate?: Date | string;

    readonly categories?: string[];

    readonly emails?: eMail[];

    readonly formattedName?: string;

    readonly fullName?: string;

    readonly geo?: GeoCoordinates[];

    readonly key?: key;

    // Logo / image entries (use `photo` shape for logo as well)
    readonly logo?: photo;

    readonly name?: name;

    readonly note?: string;

    readonly organization?: organization[];

    readonly photo?: photo[];

    readonly revision?: Date;

    readonly role?: string;

    readonly sound?: vCardProperty;

    readonly source?: URL;

    readonly telephones?: telepone[];

    readonly title?: vCardProperty[];

    readonly timeZone?: string;

    readonly uid?: string;

    readonly url?: url[];

    // TODO: Add version object with major / minor.
    readonly version?: string;

    hasAttr(attr: string): boolean;
}