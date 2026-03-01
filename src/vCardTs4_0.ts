import { gender, vCardProperty } from "./vCardTsTypes";
import { vCardTsCommon } from "./vCardTsCommon";

export interface vCardTs4_0 extends vCardTsCommon{

    readonly anniversary?: Date;

    readonly calendarAddressURI?: URL;

    readonly calendarURI?: URL;

    readonly clientPIDMap?: string;

    readonly fBURL?: URL;

    readonly gender?: gender;

    // TODO: Define IMPP type? E.G. add additional X-Service Type?
    readonly iMPP?: vCardProperty[];

    readonly kind?: string;

    readonly language?: vCardProperty[];

    readonly member?: string;

    readonly nickname?: string;

    readonly productID?: string;

    readonly related?: vCardProperty[];

    readonly xml?: string[];
}