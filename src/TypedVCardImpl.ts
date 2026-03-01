import vCard from "vcf";
import { TypedVCard } from "./TypedVCard";
import { vCardTs2_1 } from "./vCardTs2_1";
import { vCardTs3_0 } from "./vCardTs3_0";
import { vCardTs4_0 } from "./vCardTs4_0";
import { vCardTsMacAddressBook } from "./vCardTsMacAddressBook";
import { vCardTsOutlook } from "./vCardTsOutlook";
import { Err, Ok, Result } from "oxide.ts";
import { vCardTsBuilder } from "./vCardTsBuilder";

export class TypedVCardImpl implements TypedVCard {

	protected numberOfVCards: number;

	protected failedVCards: [string, vCard][] = [];

	protected vCards2_1: vCardTs2_1[] = [];

	protected vCards3_0: vCardTs3_0[] = [];

	protected vCards4_0: vCardTs4_0[] = [];

	protected macAddressBookVCards: vCardTsMacAddressBook[] = [];

	protected outlookVCards: vCardTsOutlook[] = [];

	constructor(vCards: vCard | vCard[] | string) {
		if (vCards instanceof vCard || Array.isArray(vCards)) {
			const res = this.parseVCards(vCards);
			if (res.isErr()) {
				const errRes = res.unwrapErr();
				this.numberOfVCards = errRes[0];
				this.failedVCards = errRes[1];
				return;
			}
			this.numberOfVCards = res.unwrap();
		} else if (typeof vCards === "string") {
			const res = this.parseString(vCards);
			if (res.isErr()) {
				const errRes = res.unwrapErr();
				this.numberOfVCards = errRes[0];
				this.failedVCards = errRes[1];
				return;
			}
			this.numberOfVCards = res.unwrap();
		} else {
			throw new Error("Invalid vCard input");
		}
	}

	protected parseString(vCardString: string): Result<number, [number, [string, vCard][]]> {
		const parsedVCard: vCard[] = vCard.parse(vCardString);
		return this.parseVCards(parsedVCard);
	}

	protected parseVCards(vCards: vCard | vCard[]): Result<number, [number, [string, vCard][]]> {
		let successfulVCards: number = 0;
		let failedVCards: [string, vCard][] = [];

		if (Array.isArray(vCards)) {
			for (let singleVCard of vCards) {
				const res = this.transformVCard(singleVCard);
				if (res.isErr()) {
					failedVCards.push(res.unwrapErr());
				} else {
					++successfulVCards;
				}
			}
		} else {
			const res = this.transformVCard(vCards);
			if (res.isErr()) {
				failedVCards.push(res.unwrapErr());
			} else {
					++successfulVCards;
			}
		}

		if (failedVCards.length > 0) {
			return Err([successfulVCards, failedVCards]);
		}

		return Ok(successfulVCards);
	}

	protected transformVCard(vCard: vCard): Result<void, [string, vCard]> {
		const builder = new vCardTsBuilder(vCard);
		const vCardTsRes = builder.buildvCardTs();
		if (vCardTsRes.isErr()) {
			return Err([`Failed to parse vCard: ${vCardTsRes.unwrapErr()}`, vCard]);
		}
		const vCardTs = vCardTsRes.unwrap();
		const version = vCard.version.valueOf();
		// TODO : Add MacAddressBook and Outlook detection
		if (version === "4.0") {
			this.vCards4_0.push(vCardTs as vCardTs4_0);
		} else if (version === "3.0") {
			this.vCards3_0.push(vCardTs as vCardTs3_0);
		} else if (version === "2.1") {
			this.vCards2_1.push(vCardTs as vCardTs2_1);
		} else {
			return Err([`Unsupported vCard version: ${version}`, vCard]);
		}
		return Ok(undefined);
	}

	getVCardsV2_1(): vCardTs2_1[] {
		return this.vCards2_1;
	}

	getVCardsV3_0(): vCardTs3_0[] {
		return this.vCards3_0;
	}

	getVCardsV4_0(): vCardTs4_0[] {
		return this.vCards4_0;
	}

	getMacAddressBookVCards(): vCardTsMacAddressBook[] {
		return this.macAddressBookVCards;
	}

	getOutlookVCards(): vCardTsOutlook[] {
		return this.outlookVCards;
	}

	getNumberOfVCards(): number {
		return this.numberOfVCards;
	}
}