import { vCardTs2_1 } from "./vCardTs2_1";

export interface vCardTsOutlook extends vCardTs2_1 {

	// TODO: Add support for the extra fields in MS OUTLOOK vCard

	readonly nickname?: string;
}