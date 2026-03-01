import { Err, Ok, Result } from "oxide.ts";
import vCard, { Property } from "vcf";
import { vCardProperty } from "./vCardTsTypes";
import { vCardTs3_0 } from "./vCardTs3_0";
import { vCardTsCommonImpl } from "./vCardTsCommonImpl";

export class vCardTs3_0Impl extends vCardTsCommonImpl implements vCardTs3_0 {

    readonly agent?: URL;
    readonly class?: string;
    readonly iMPP?: vCardProperty[];
    readonly label?: string;
    readonly mailer?: string;
    readonly nickname?: string;
    readonly productID?: string;
    readonly profile?: string;
    readonly sortString?: string;

    constructor(vCard: vCard) {
        super(vCard);

        this.agent = this.getEntry("agent", this.getAgent);
        this.class = this.getEntry("class", this.getClass);
        this.iMPP = this.getEntry("impp", this.getIMPP);
        this.label = this.getEntry("label", this.getLabel);
        this.mailer = this.getEntry("mailer", this.getMailer);
        this.nickname = this.getEntry("nickname", this.getNickname);
        this.productID = this.getEntry("prodid", this.getProductID);
        this.profile = this.getEntry("profile", this.getProfile);
        this.sortString = this.getEntry("sort-string", this.getSortString);
    }

    private getAgent(prop: Property | Property[]): Result<URL | undefined, string> {
        const agent = prop.valueOf() as string;
        try {
            return Ok(new URL(agent));
        } catch (error: unknown) {
            return Err(`Invalid URL for agent: ${agent}, ${(error as Error).message}`);
        }
    }

    private getClass(prop: Property | Property[]): Result<string | undefined, string>{
        return Ok(prop.valueOf() as string);
    }

    private getIMPP(prop: Property | Property[]): Result<vCardProperty[] | undefined, string> {
        const imppArr: Property[] = prop instanceof Property ? [prop] : prop;
        let imppList: vCardProperty[] = [];

        for (let impp of imppArr) {
            const imppRes = this.convertProperty(impp);
            if (imppRes.isErr()) {
                return Err(`VCard is invalid (${impp}: ${imppRes.unwrapErr()})`);
            }
            imppList.push(imppRes.unwrap());
        }

        return imppList.length > 0 ? Ok(imppList) : Ok(undefined);
    }

    private getLabel(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getMailer(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getNickname(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getProductID(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getProfile(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getSortString(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }
}