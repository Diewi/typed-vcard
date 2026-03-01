import { vCardTs2_1 } from "./vCardTs2_1";
import { vCardTs4_0 } from "./vCardTs4_0";
import { vCardTs3_0 } from "./vCardTs3_0";
import { vCardTsMacAddressBook } from "./vCardTsMacAddressBook";
import { vCardTsOutlook } from "./vCardTsOutlook";

export interface TypedVCard {
	getVCardsV2_1(): vCardTs2_1[];

	getVCardsV3_0(): vCardTs3_0[];

	getVCardsV4_0(): vCardTs4_0[];

	getMacAddressBookVCards(): vCardTsMacAddressBook[];

	getOutlookVCards(): vCardTsOutlook[];

	getNumberOfVCards(): number;
}