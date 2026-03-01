import { vCardProperty } from "./vCardTsTypes";
import { vCardTsCommon } from "./vCardTsCommon";

export interface vCardTs3_0 extends vCardTsCommon {

    readonly agent?: URL;

    readonly class?: string;

    readonly iMPP?: vCardProperty[];

    readonly label?: string;

    readonly mailer?: string;

    readonly nickname?: string;

    readonly productID?: string;

    readonly profile?: string;

    readonly sortString?: string;
}