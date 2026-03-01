import vCard from "vcf";
import { Result, Ok } from "oxide.ts";
import { vCardTs3_0Impl } from "./vCardTs3_0Impl";
import { vCardTsMacAddressBook } from "./vCardTsMacAddressBook";

export class vCardTsMacAddressBookImpl extends vCardTs3_0Impl implements vCardTsMacAddressBook {

	constructor(vCard: vCard) {
		super(vCard);
	}
}