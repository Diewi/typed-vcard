import vCard, { Property } from "vcf";
import { Result, Ok } from "oxide.ts";
import { vCardTs2_1Impl } from "./vCardTs2_1Impl";
import { vCardTsOutlook } from "./vCardTsOutlook";

export class vCardTsOutlookImpl extends vCardTs2_1Impl implements vCardTsOutlook {

	readonly nickname?: string;

	constructor(vCard: vCard) {
		super(vCard);

		this.nickname = this.getEntry("nickname", this.getNickname);
	}

	private getNickname(prop: Property | Property[]): Result<string | undefined, string> {
		return Ok(prop.valueOf() as string);
	}
}