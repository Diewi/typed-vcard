import vCard from "vcf";
import { vCardTs2_1 } from "./vCardTs2_1";
import { vCardTs2_1Impl } from "./vCardTs2_1Impl";
import { vCardTs3_0 } from "./vCardTs3_0";
import { vCardTs3_0Impl } from "./vCardTs3_0Impl";
import { vCardTs4_0 } from "./vCardTs4_0";
import { vCardTs4_0Impl } from "./vCardTs4_0Impl";
import { Result, Err, Ok } from "oxide.ts";

export class vCardTsBuilder {
    vCard: vCard;

    constructor(vCard: vCard) {
        this.vCard = vCard;
    }

    buildvCardTs(): Result<vCardTs4_0 | vCardTs3_0 | vCardTs2_1, string> {
        const version = this.vCard.version.valueOf();
        if (version === "4.0") {
            const vCardTs4_0 = this.buildvCardTs4_0();
            return vCardTs4_0;
        } else if (version === "3.0") {
            const vCardTs3_0 = this.buildvCardTs4_0();
            return vCardTs3_0;
        } else if (version === "2.1") {
            const vCardTs2_1 = this.buildvCardTs2_1();
            return vCardTs2_1;
        } else {
            return Err("vCard version not supported");
        }
    }

    buildvCardTs2_1(): Result<vCardTs2_1, string> {
        return Ok(new vCardTs2_1Impl(this.vCard));
    }

    buildvCardTs3_0(): Result<vCardTs3_0, string> {
        return Ok(new vCardTs3_0Impl(this.vCard));
    }

    buildvCardTs4_0(): Result<vCardTs4_0, string> {
        return Ok(new vCardTs4_0Impl(this.vCard));
    }
}