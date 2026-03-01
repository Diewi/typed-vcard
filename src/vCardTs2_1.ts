import { vCardTsCommon } from "./vCardTsCommon";

export interface vCardTs2_1 extends vCardTsCommon {

    readonly agent?: URL;

    readonly label?: string;

    readonly mailer?: string;

    readonly profile?: string;

    readonly sortString?: string;
}