import { toDate } from "date-fns-tz";
import { Err, Ok, Result } from "oxide.ts";
import vCard, { Property } from "vcf";
import { gender, relatedType, vCardProperty } from "./vCardTsTypes";
import { vCardTs4_0 } from "./vCardTs4_0";
import { vCardTsCommonImpl } from "./vCardTsCommonImpl";
import { convertProperty } from "./vCardTsUtils";

export class vCardTs4_0Impl extends vCardTsCommonImpl implements vCardTs4_0 {

    readonly anniversary?: Date;
    readonly calendarAddressURI?: URL;
    readonly calendarURI?: URL;
    readonly clientPIDMap?: string;
    readonly fBURL?: URL;
    readonly gender?: gender;
    readonly iMPP?: vCardProperty[];
    readonly kind?: string;
    readonly language?: vCardProperty[];
    readonly member?: string;
    readonly nickname?: string;
    readonly productID?: string;
    readonly related?: vCardProperty[];
    readonly xml?: string[];

    constructor(vCard: vCard) {
        super(vCard);

        this.anniversary = this.getEntry("anniversary", this.getAnniversary);
        this.calendarAddressURI = this.getEntry("caladruri", this.getCalendarAddressURI);
        this.calendarURI = this.getEntry("calendaruri", this.getCalendarURI);
        this.clientPIDMap = this.getEntry("clientpidmap", this.getClientPidMap);
        this.fBURL = this.getEntry("fburl", this.getfBURL);
        this.gender = this.getEntry("gender", this.getGender);
        this.iMPP = this.getEntry("impp", this.getIMPP);
        this.kind = this.getEntry("kind", this.getKind);
        this.language = this.getEntry("lang", this.getLanguage);
        this.member = this.getEntry("member", this.getMember);
        this.nickname = this.getEntry("nickname", this.getNickname);
        this.productID = this.getEntry("prodid", this.getProductID);
        this.related = this.getEntry("related", this.getRelated);
        this.xml = this.getEntry("xml", this.getXML);
    }

    private getAnniversary(prop: Property | Property[]): Result<Date | undefined, string> {
        let anniversary = prop.valueOf() as string;
        if (anniversary) {
            try {
                let anni: Date = toDate(anniversary);
                return anni.toString() !== "Invalid Date"
                    ? Ok(new Date(anni))
                    : Err("Invalid date format at field 'anniversary'.");
            } catch (error) {
                return Err("Invalid date format at field 'anniversary'. \
                    Supported formats are 'yyyy-MM-dd', and 'yyyyMMdd', and \
                    yyyyMMdd'T'HHmmXXX.");
            }
        }
        return Ok(undefined);
    }

    private getCalendarAddressURI(prop: Property | Property[]): Result<URL | undefined, string> {
        const calendarAddressURI = prop.valueOf() as string;
        if(calendarAddressURI) {
            try {
                return Ok(new URL(calendarAddressURI));
            } catch (error: unknown) {
                return Err(`Invalid URL for agent: ${calendarAddressURI}, ${(error as Error).message}`);
            }
        }
        return Ok(undefined);
    }

    private getCalendarURI(prop: Property | Property[]): Result<URL | undefined, string> {
        const calendarURI = prop.valueOf() as string;
        try {
            return Ok(new URL(calendarURI));
        } catch (error: unknown) {
            return Err(`Invalid URL for agent: ${calendarURI}, ${(error as Error).message}`);
        }
    }

    private getClientPidMap(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getfBURL(prop: Property | Property[]): Result<URL | undefined, string> {
        const fburl = prop.valueOf() as string;
        try {
            return Ok(new URL(fburl));
        } catch (error: unknown) {
            return Err(`Invalid URL for agent: ${fburl}, ${(error as Error).message}`);
        }
    }

    private getGender(prop: Property | Property[]): Result<gender | undefined, string> {
        if (Array.isArray(prop)) {
            return Err("vCard is invalid: Gender property may only be defined once.");
        }

        const genderRes = convertProperty(prop as Property);
        if (genderRes.isErr()) {
            return genderRes;
        }
        const gender = genderRes.unwrap();
        const genderValue = prop.valueOf() as string;
        const genderArr = genderValue.split(';');
        if (genderArr.length > 2) {
            return Err(`VCard is invalid: Gender property contains more than two values (${genderValue})`);
        }
        // TODO: Unit test (mock?) for different variants of defining gender:
        // https://datatracker.ietf.org/doc/html/rfc6350#section-6.2.7
        return Ok({
            params: gender.params,
            tag: gender.tag,
            preferenceIdx: gender.preferenceIdx,
            valueType: gender.valueType,
            value: genderValue,
            sex: genderArr[0] != "" ? genderArr[0] : undefined,
            indentity: genderArr.length > 1 ? genderArr[1] : undefined
        });
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

    private getKind(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getLanguage(prop: Property | Property[]): Result<vCardProperty[] | undefined, string> {
        const langArr: Property[] = prop instanceof Property ? [prop] : prop;
        let langList: vCardProperty[] = [];

        for (let lang of langArr) {
            const langRes = this.convertProperty(lang);
            if (langRes.isErr()) {
                return Err(`VCard is invalid (${lang}: ${langRes.unwrapErr()})`);
            }
            langList.push(langRes.unwrap());
        }

        return langList.length > 0 ? Ok(langList) : Ok(undefined);
    }

    private getMember(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getNickname(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getProductID(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    private getRelated(prop: Property | Property[]): Result<vCardProperty[] | undefined, string> {
        const relatedArr: Property[] = prop instanceof Property ? [prop] : prop;
        let relatedList: vCardProperty[] = [];

        for (let relatedPropElem of relatedArr) {
            const relatedRes = this.convertProperty(relatedPropElem);
            const relatedVProp = relatedRes.unwrap();
            if (relatedRes.isErr()) {
                return relatedRes;
            }

            const relatedTypeList: relatedType[] | undefined = relatedVProp.type?.map(type => {
                switch (type) {
                    case "contact":
                        return relatedType.CONTACT;
                    case "acquaintance":
                        return relatedType.ACQUAINTANCE;
                    case "friend":
                        return relatedType.FRIEND;
                    case "met":
                        return relatedType.MET;
                    case "co-worker":
                        return relatedType.CO_WORKER;
                    case "colleague":
                        return relatedType.COLLEAGUE;
                    case "co-resident":
                        return relatedType.CO_RESIDENT;
                    case "neighbor":
                        return relatedType.NEIGHBOR;
                    case "child":
                        return relatedType.CHILD;
                    case "parent":
                        return relatedType.PARENT;
                    case "sibling":
                        return relatedType.SIBLING;
                    case "spouse":
                        return relatedType.SPOUSE;
                    case "kin":
                        return relatedType.KIN;
                    case "muse":
                        return relatedType.MUSE;
                    case "crush":
                        return relatedType.CRUSH;
                    case "date":
                        return relatedType.DATE;
                    case "sweetheart":
                        return relatedType.SWEETHEART;
                    case "me":
                        return relatedType.ME;
                    case "agent":
                        return relatedType.AGENT;
                    case "emergency":
                        return relatedType.EMERGENCY;
                    default:
                        return undefined;
                }
            }).filter(type => {return type !== undefined;}) as relatedType[];
            if (relatedTypeList && relatedTypeList?.length > 1) {
                return Err(`VCard is invalid (${relatedVProp}: ${relatedTypeList}:"
                    + "Multiple related types in a single property are not allowed)`);
            }

            const related = {
                params: relatedVProp.params,
                type: relatedVProp.type,
                tag: relatedVProp.tag,
                preferenceIdx: relatedVProp.preferenceIdx,
                ValueType: relatedVProp.valueType,
                value: relatedVProp.value,
                relatedType: relatedTypeList[0],
                relatedUri: relatedVProp.valueType === "uri" ? (relatedVProp.value as string) : undefined,
                relatedText: relatedVProp.valueType === "text" ? (relatedVProp.value as string) : undefined
            };
        }

        return relatedList.length > 0 ? Ok(relatedList) : Ok(undefined);
    }

    private getXML(prop: Property | Property[]): Result<string[] | undefined, string> {
        const xmlPropArr = prop instanceof Property ? [prop] : prop;
        return xmlPropArr.length > 0 ? Ok(xmlPropArr.map(prop => prop.valueOf() as string)) : Ok(undefined);
    }
}