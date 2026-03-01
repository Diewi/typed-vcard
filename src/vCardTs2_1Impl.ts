import { Err, Ok, Result } from "oxide.ts";
import vCard, { Property } from "vcf";
import { photo, vCardProperty } from "./vCardTsTypes";
import { vCardTs2_1 } from "./vCardTs2_1";
import { vCardTsCommonImpl } from "./vCardTsCommonImpl";

export class vCardTs2_1Impl extends vCardTsCommonImpl implements vCardTs2_1 {

    readonly agent?: URL;
    readonly label?: string;
    readonly mailer?: string;
    readonly profile?: string;
    readonly sortString?: string;

    constructor(vCard: vCard) {
        super(vCard);

        this.agent = this.getEntry("agent", this.getAgent);
        this.label = this.getEntry("label", this.getLabel);
        this.mailer = this.getEntry("mailer", this.getMailer);
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

    private getLabel(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getMailer(prop: Property | Property[]): Result<string | undefined, string> {
        const mailerProp = prop.valueOf() as string;
        return mailerProp ? Ok(mailerProp.valueOf() as string) : Ok(undefined);
    }

    convertPhoto(vCardProp: vCardProperty): Result<photo, string> {
        let photoRes = super.convertPhoto(vCardProp);
        if (photoRes.isErr()) {
            return photoRes;
        }
        const photo = photoRes.unwrap();
        photo.mediaType = {
            type: "image",
            subType: photo.type ? photo.type[0] : undefined,
        };
        return Ok(photo);
    }

    private getProfile(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getSortString(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }
}