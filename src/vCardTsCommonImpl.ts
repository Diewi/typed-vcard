import vCard, { Property } from "vcf";

import { parseISO } from "date-fns";
import { toDate } from "date-fns-tz";
import { Err, Ok, Result } from "oxide.ts";
import { address, eMail, GeoCoordinates, key, MailType, MediaType, name, organization, phoneCapabilities, phoneDevice, photo, telepone, url, ValueType, valueUri, vCardProperty } from "./vCardTsTypes";
import { vCardTsCommon } from "./vCardTsCommon";
import * as utils from "./vCardTsUtils";

export class vCardTsCommonImpl implements vCardTsCommon {
    vCard: vCard;

    private vCardValid: boolean = true;

    readonly addresses?: vCardProperty[];
    readonly birthdate?: Date | string;
    readonly categories?: string[];
    readonly emails?: vCardProperty[];
    readonly formattedName?: string;
    readonly geo?: GeoCoordinates[];
    readonly honorificPrefixes?: string;
    readonly honorificSuffixes?: string;
    readonly key?: key;
    readonly logo?: vCardProperty;
    readonly middlenames?: string;
    readonly name?: name;
    readonly note?: string;
    readonly organization?: organization[];
    readonly photo?: photo[];
    readonly revision?: Date;
    readonly role?: string;
    readonly sound?: vCardProperty;
    readonly source?: URL;
    readonly telephones?: telepone[];
    readonly title?: vCardProperty[];
    readonly timeZone?: string;
    readonly uid?: string;
    readonly url?: url[];
    readonly version?: string;

    constructor(vCard: vCard)
    {
        this.vCard = vCard;

        this.addresses = this.getEntry("adr", this.getAddresses);
        this.birthdate = this.getEntry("bday", this.getBirthday);
        this.categories = this.getEntry("categories", this.getCategories);
        this.emails = this.getEntry("email", this.getEmails);
        this.formattedName = this.getEntry("fn", this.getFormattedName);
        this.geo = this.getEntry("geo", this.getGeo);
        this.key = this.getEntry("key", this.getKey);
        this.logo = this.getEntry("logo", this.getLogo);
        this.name = this.getEntry("n", this.getN);
        this.note = this.getEntry("note", this.getNote);
        this.organization = this.getEntry("org", this.getOrganization);
        this.photo = this.getEntry("photo", this.getPhoto);
        this.revision = this.getEntry("rev", this.getRevision);
        this.role = this.getEntry("role", this.getRole);
        this.sound = this.getEntry("sound", this.getSound);
        this.source = this.getEntry("source", this.getSource);
        this.telephones = this.getEntry("tel", this.getTelephones);
        this.timeZone = this.getEntry("tz", this.getTimeZone);
        this.title = this.getEntry("title", this.getTitle);
        this.uid = this.getEntry("uuid", this.getUuid);
        this.url = this.getEntry("url", this.getUrl);
        this.version = this.getEntry("version", this.getVersion);
    }

    getEntry<R>(attr: string, method: (attr: Property | Property[]) => Result<R, string>): R | undefined {
        const prop = this.vCard.get(attr);
        if (!prop) {
            return undefined;
        }
        let ret = method.call(this, prop);
        if (ret.isOk()) {
            return ret.unwrap();
        } else {
            this.vCardValid = false;
            return undefined;
        }
    }

    convertProperty(prop: Property): Result<vCardProperty, string> {
        let vCardPropRes = utils.convertProperty(prop);
        if (vCardPropRes.isErr()) {
            return vCardPropRes;
        }

        const vCardProp = vCardPropRes.unwrap();
        if (prop.is("pref")){
            vCardProp.preferenceIdx = 1;
        }
        return Ok(vCardProp);
    }

    getAddresses(prop: Property | Property[]): Result<vCardProperty[] | undefined, string> {
        const tmpAddressArr: Property[] = prop instanceof Property ? [prop] : prop;
        let addressList: vCardProperty[] = [];

        for (let address of tmpAddressArr) {
            const addrResult = this.convertProperty(address);
            if (addrResult.isErr()) {
                return Err(`VCard is invalid (${address}: ${addrResult.unwrapErr()})`);
            }
            const addrVProp = addrResult.unwrap();
            const addrConv = this.convertAddress(addrVProp);
            if (addrConv.isErr()) {
                return Err(`VCard is invalid (${address}: ${addrConv.unwrapErr()})`);
            }
            addressList.push(addrConv.unwrap());
        }

        return addressList.length > 0 ? Ok(addressList) : Ok(undefined);
    }

    convertAddress(vCardProp: vCardProperty): Result<address, string> {
        // ADR components (per vCard spec):
        // PO Box; Extended Address; Street; Locality (city); Region; Postal Code; Country
        let parts: string[] = [];
        if (Array.isArray(vCardProp.value)) {
            parts = vCardProp.value as string[];
        } else if (typeof vCardProp.value === 'string') {
            parts = (vCardProp.value as string).split(";");
        }

        // normalize parts to at least 7 elements
        while (parts.length < 7) {
            parts.push("");
        }

        const labelRes = utils.getStringFromParams(vCardProp, "adr", "label");
        if (labelRes.isErr()) {
            return Err(labelRes.unwrapErr());
        }

        const addrObj: address = {
            params: vCardProp.params,
            tag: vCardProp.tag,
            type: vCardProp.type,
            preferenceIdx: vCardProp.preferenceIdx,
            valueType: vCardProp.valueType,
            value: vCardProp.value,
            poBox: parts[0] || undefined,
            extendedAddress: parts[1] || undefined,
            street: parts[2] || undefined,
            locality: parts[3] || undefined,
            region: parts[4] || undefined,
            postalCode: parts[5] || undefined,
            country: parts[6] || undefined,
            label: labelRes.unwrap(),
            fullAddress: typeof vCardProp.value === 'string' ? vCardProp.value as string : undefined,
        };

        return Ok(addrObj);
    }

    getBirthday(prop: Property | Property[]): Result<Date| string | undefined, string> {
        if (Array.isArray(prop)) {
            return Err("Invalid birthday format: Field 'bday' is present multiple times.");
        }
        const bdayProp = this.convertProperty(prop);
        if (bdayProp.isErr()) {
            return Err(`VCard is invalid (bday: ${bdayProp.unwrapErr()})`);
        }
        let birthday = bdayProp.unwrap().value as string;
        if (birthday) {
            try {
                let bday: Date = toDate(birthday);
                if(bday.toString() !== "Invalid Date") {
                    return Ok(bday);
                } else if ((/^--[0-9]\d{0,4}$/gm).test(birthday)) {
                    // Partial date with year missing (e.g. --0203 for Feb 3rd)
                    return Ok(birthday);
                } else if (bdayProp.unwrap().params
                        && bdayProp.unwrap().params['value'] === ValueType.TEXT) {
                    // Handle text-based birthday (e.g. "circa 1800")
                    return Ok(birthday);
                } else {
                    return Err("Invalid date format at filed 'bday'.");
                }
            } catch (error) {
                return Err("Invalid date format at filed 'bday'. \
                    Supported formats are 'yyyy-MM-dd' and 'yyyyMMdd'.");
            }
        }
        return Ok(undefined);
    }

    getCategories(prop: Property | Property[]): Result<string[] | undefined, string> {
        return Ok(this.vCard.get("categories")?.valueOf() as string[]);
    }

    getEmails(prop: Property | Property[]): Result<eMail[] | undefined, string> {
        const tmpMailArr: Property[] = prop instanceof Property ? [prop] : prop;
        let mailList: eMail[] = [];

        for (let email of tmpMailArr) {
            const vCardProp = this.convertProperty(email);

            if (vCardProp.isErr()) {
                return Err(`VCard is invalid (${email}: ${vCardProp.unwrapErr()})`);
            }
            const eMailConv = this.convertEmail(vCardProp.unwrap());
            if (eMailConv.isErr()) {
                return Err(`VCard is invalid (${email}: ${eMailConv.unwrapErr()})`);
            }
            mailList.push(eMailConv.unwrap());
        }

        return mailList.length >= 1 ? Ok(mailList) : Ok(undefined);
    }

    convertEmail(vCardProp: vCardProperty): Result<eMail, string> {
        const addrType: MailType = vCardProp.type ?
            (vCardProp.type.includes("x400")  ? MailType.x400 : MailType.internet)
            : MailType.internet;

        let eMailItem: eMail = {
            params: vCardProp.params,
            tag: vCardProp.tag,
            addressType: addrType,
            preferenceIdx: vCardProp.preferenceIdx,
            valueType: vCardProp.valueType,
            value: vCardProp.value,
        };
        return Ok(eMailItem);
    }

    getFormattedName(prop: Property | Property[]): Result<string | undefined, string> {
        let fn = prop.valueOf() as string;
        if (fn) {
            return Ok(utils.getUnescapedString(fn));
        }
        return Err("Mandatory field 'fn' (formatted name) is missing.");
    }

    getGeo(prop: Property | Property[]): Result<GeoCoordinates[] | undefined, string> {
        // TODO: Fix code duplication with vCardTs3_0Impl
        const geoArr: Property[] = prop instanceof Property ? [prop] : prop;
        let geoList: GeoCoordinates[] = [];

        for (let geo of geoArr) {
            const geoRes = this.convertProperty(geo);
            if (geoRes.isErr()) {
                return Err(`VCard is invalid (${geo}: ${geoRes.unwrapErr()})`);
            }
            let latLongStr = geoRes.unwrap().value as string;
            // Remove optional geo: prefix (vCard 4.0)
            latLongStr = latLongStr.replace("geo:", "");
            // comma for vCard 4.0, semicolon for vCard 3.0 and 2.1
            const splitChar = latLongStr.includes(",") ? "," : ";"
            const [latitude, longitude] = latLongStr.split(splitChar).map(Number);
            geoList.push({ ...geoRes.unwrap(), latitude, longitude });
        }

        return geoList.length > 0 ? Ok(geoList) : Ok(undefined);
    }

    // Integrated implementation: convert and return a typed `key` object from a single Property
    getKey(prop: Property | Property[]): Result<key | undefined, string> {
        if (Array.isArray(prop)) {
            return Err("Invalid key format: Field 'key' is present multiple times.");
        }
        if (!prop) {
            return Ok(undefined);
        }

        const propRes = this.convertProperty(prop);
        if (propRes.isErr()) {
            return Err(`VCard is invalid (key: ${propRes.unwrapErr()})`);
        }
        const vCardProp = propRes.unwrap();

        // Decide whether the value is a URI (keyUri) or inline/text key material.
        const rawValue = vCardProp.value;
        let keyUri: valueUri | undefined = undefined;
        let valueType: ValueType | undefined = vCardProp.valueType;

        if (valueType === ValueType.URI || (typeof rawValue) === "string") {
            const s = rawValue as string;
            try {
                new URL(s);
                keyUri = { uri: s } as valueUri;
                valueType = ValueType.URI;
            } catch (err) {
                return Err(`VCard is invalid (key: Value is not a valid URI: ${s})`);
            }
        }

        const keyObj: key = {
            params: vCardProp.params,
            type: vCardProp.type,
            tag: vCardProp.tag,
            preferenceIdx: vCardProp.preferenceIdx,
            valueType: valueType,
            value: vCardProp.value,
            keyUri: keyUri,
        };

        return Ok(keyObj);
    }

    // FIMXE: Implemenation is not correct.
    getLogo(prop: Property | Property[]): Result<vCardProperty | undefined, string> {
        // TODO: Add simplified getters to the version-specific vCardTs interfaces
        if (Array.isArray(prop)) {
            return Ok(undefined);
        } else if (prop) {
            return this.convertProperty(prop);
        } else {
            return Ok(undefined);
        }
    }

    // FIXME: Check vCard spec for mandatory fields. Undefined is not allowed.
    getN(prop: Property | Property[]): Result<name | undefined, string> {
        if (Array.isArray(prop)) {
            return Err("Invalid name format: Field 'n' is present multiple times.");
        }
        else if (prop) {
            const nPropRes = this.convertProperty(prop);
            if (nPropRes.isErr()) {
                return nPropRes
            }
            const nProp = nPropRes.unwrap();

            const locale = utils.getStringFromParams(nProp, "n", "language");

            const name = nProp.value;
            const nameObj: name = {
                params: nProp.params,
                valueType: nProp.valueType,
                value: nProp.value,
                locale: locale.unwrap(),
                familyName: name.length > 0 ? name[0] : undefined,
                givenName: name.length > 1 ? name[1] : undefined,
                additionalName: name.length > 2 ? name[2] : undefined,
                honorificPrefix: name.length > 3 ? name[3] : undefined,
                honorificSuffix: name.length > 4 ? name[4] : undefined,
            };
            return Ok(nameObj);
        }
        return Ok(undefined);
    }

    getNote(prop: Property | Property[]): Result<string | undefined, string> {
        let note = prop.valueOf() as string;
        if (note) {
            return Ok(utils.getUnescapedString(note));
        }
        return Ok(undefined);
    }

    getOrganization(prop: Property | Property[]): Result<organization[] | undefined, string> {
        const tmpOrgArr: Property[] = prop instanceof Property ? [prop] : prop;
        let orgList: organization[] = [];

        for (const orgProp of tmpOrgArr) {
            const orgResult = this.convertProperty(orgProp);
            if (orgResult.isErr()) {
                return Err(`VCard is invalid (${orgProp}: ${orgResult.unwrapErr()})`);
            }
            const orgVProp = orgResult.unwrap();
            const orgParts = (orgVProp.value as string).split(";")
            const orgName = orgParts[0] as string;
            const orgUnit = orgParts.slice(1) as string[];

            const orgObj: organization =  {
                params: orgVProp.params,
                tag: orgVProp.tag,
                type: orgVProp.type,
                preferenceIdx: orgVProp.preferenceIdx,
                value: orgVProp.value,
                valueType: orgVProp.valueType,
                organizationName: orgName,
                organizationUnit: orgUnit.length > 0 ? orgUnit : undefined,
            };
            orgList.push(orgObj);
        }

        return orgList.length > 0 ? Ok(orgList) : Ok(undefined);
    }

    getPhoto(prop: Property | Property[]): Result<photo[] | undefined, string> {
        const tmpPhotoArr: Property[] = prop instanceof Property ? [prop] : prop;
        let photoList: photo[] = [];

        for (let photo of tmpPhotoArr) {
            const vCardProp = this.convertProperty(photo);
            if (vCardProp.isErr()) {
                return Err(`VCard is invalid (${photo}: ${vCardProp.unwrapErr()})`);
            }

            const photoConv = this.convertPhoto(vCardProp.unwrap());
            if (photoConv.isErr()) {
                return Err(`VCard is invalid (${photo}: ${photoConv.unwrapErr()})`);
            }
            photoList.push(photoConv.unwrap());
        }

        return photoList.length >= 1 ? Ok(photoList) : Ok(undefined);
    }

    convertPhoto(vCardProp: vCardProperty): Result<photo, string> {
        let mediaType: MediaType | undefined = undefined;
        const mediaTypeRes = utils.getStringFromParams(vCardProp, "photo", "media-type");
        if (mediaTypeRes.isErr()) {
            return mediaTypeRes;
        }
        const mediaTypeStr = mediaTypeRes.unwrap();
        if (mediaTypeStr) {
            const mediaTypeArr = mediaTypeStr.split("/");
            mediaType = {
                type: mediaTypeArr[0],
                subType: mediaTypeArr[1],
            }
        }

        let encodingRes = utils.getStringFromParams(vCardProp, "photo", "encoding");
        if (encodingRes.isErr()) {
            return encodingRes;
        }
        // Sometimes, the encoding is not given in the encoding, but plain, which is regognized
        // as the "type", thus, we convert it below.
        if (!encodingRes.unwrap() && vCardProp.type) {
            encodingRes = utils.getStringFromParams(vCardProp, "photo", "type");
            if (encodingRes.isErr()) {
                return encodingRes;
            }
            // Only base64 is supported for the heuristic
            if (encodingRes.unwrap() == "base64") {
                encodingRes = Ok("base64");
            } else {
                encodingRes = Ok(undefined);
            }
        }
        const encodingStr = encodingRes.unwrap();

        return Ok({
            params: vCardProp.params,
            tag: vCardProp.tag,
            type: vCardProp.type,
            mediaType: mediaType,
            encoding: encodingStr,
            preferenceIdx: vCardProp.preferenceIdx,
            valueType: vCardProp.valueType,
            value: vCardProp.value
        });
    }

    getRevision(prop: Property | Property[]): Result<Date | undefined, string> {
        const rev = prop.valueOf() as string;
        if (rev) {
            // const parsedDate = parse(name, "yyyyMMdd'T'HHmmssX", new Date());
            return Ok(parseISO(rev));
        }
        return Ok(undefined);
    }

    getRole(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    getSound(prop: Property | Property[]): Result<vCardProperty | undefined, string> {
        // TODO: Add simplified getters to the version-specific vCardTs interfaces
        if (Array.isArray(prop)) {
            return Ok(undefined);
        } else if (prop) {
            return this.convertProperty(prop);
        } else {
            return Ok(undefined);
        }
    }

    getSource(prop: Property | Property[]): Result<URL | undefined, string> {
        let url = prop.valueOf() as string;
        if (url) {
            // Some vCards (MAC Address Book) escape the double colon despite it is atypical for
            // vCard version 3.0.
            url = url.replace("\\:", ":");
        }
        if (url) {
            return Ok(new URL(url));
        }
        return Ok(undefined);
    }

    getTelephones(prop: Property | Property[]): Result<telepone[] | undefined, string> {
        const tmpTelArr: Property[] = prop instanceof Property ? [prop] : prop;
        let telephoneList: telepone[] = [];

        for (const telProp of tmpTelArr) {
            const telResult = this.convertProperty(telProp);
            if (telResult.isErr()) {
                return Err(`VCard is invalid (${telProp}: ${telResult.unwrapErr()})`);
            }
            const telVProp = telResult.unwrap();
            let telUri: valueUri | undefined = undefined;
            if (telVProp.type?.includes("URI")) {
                if (typeof telVProp.value !== "string") {
                    return Err(`VCard is invalid (${telProp}: ${telVProp}: Tel URI is not a string)`);
                }
                telUri = {
                    uri: encodeURIComponent(telVProp.value),
                    mediatype: {
                        type: "tel"
                    }
                }
            }
            // FIXME: Check vCard spec for mandatory fields: Do we always have the device type and
            // should throw an error if not present?
            const deviceTypeList: phoneDevice[] | undefined = telVProp.type?.map(type => {
                    switch (type) {
                        case "tel":
                            return phoneDevice.TEL;
                        case "cell":
                            return phoneDevice.CELL;
                        case "fax":
                            return phoneDevice.FAX;
                        case "pager":
                            return phoneDevice.PAGER;
                        case "textphone":
                            return phoneDevice.TEXTPHONE;
                        default:
                            return undefined;
                    }
                }).filter(phoneDevice => {return phoneDevice !== undefined;}) as phoneDevice[];
            if (deviceTypeList && deviceTypeList?.length > 1) {
                return Err(`VCard is invalid (${telProp}: ${deviceTypeList}: Multiple device types found)`);
            }

            const deviceCapList: phoneCapabilities[] | undefined = telVProp.type?.map(type => {
                    switch (type) {
                        case "voice":
                            return phoneCapabilities.VOICE;
                        case "video":
                            return phoneCapabilities.VIDEO;
                        case "text":
                            return phoneCapabilities.TEXT;
                        default:
                            return undefined;
                    }
                }).filter(phoneCaps => {return phoneCaps !== undefined;}) as phoneCapabilities[];

            const telObj: telepone =  {
                params: telVProp.params,
                tag: telVProp.tag,
                type: telVProp.type,
                preferenceIdx: telVProp.preferenceIdx,
                value: telVProp.value,
                valueType: telVProp.valueType
                    ? telVProp.valueType as ValueType.URI | ValueType.TEXT
                    : (telVProp.type?.includes("URI") ? ValueType.URI : ValueType.TEXT),
                valueUri: telUri,
                device: deviceTypeList ? deviceTypeList[0] : undefined,
                capabilities: deviceCapList ? deviceCapList : [],
            };
            telephoneList.push(telObj);
        }

        return telephoneList.length > 0 ? Ok(telephoneList) : Ok(undefined);
    }

    getTimeZone(prop: Property | Property[]): Result<string | undefined, string> {
        const timezone = prop.valueOf() as string;
        if (timezone) {
            return Ok(timezone);
        }
        return Ok(undefined);
    }

    getTitle(prop: Property | Property[]): Result<vCardProperty[] | undefined, string> {
        const tmpTitleArr: Property[] = prop instanceof Property ? [prop] : prop;
        let titleList: vCardProperty[] = [];

        for (let title of tmpTitleArr) {
            const vCardProp = this.convertProperty(title);

            if (vCardProp.isErr()) {
                return Err(`VCard is invalid (${title}: ${vCardProp.unwrapErr()})`);
            }
            titleList.push(vCardProp.unwrap());
        }

        return titleList.length >= 1 ? Ok(titleList) : Ok(undefined);
    }

    getUuid(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    getUrl(prop: Property | Property[]): Result<url[] | undefined, string> {
        const urlPropArr: Property[] = prop instanceof Property ? [prop] : prop;
        let urlPropList: url[] = [];
        for (const urlProp of urlPropArr) {
            const urlResult = this.convertProperty(urlProp);
            if (urlResult.isErr()) {
                return urlResult
            }
            const urlPropObj = urlResult.unwrap();
            let url;
            try {
                url = new URL(urlPropObj.value as string);
            } catch (err) {
                return Err(`VCard is invalid (${urlProp}: ${urlPropObj}: No proper URL found)`);
            }
            const urlObj: url = {
                params: urlPropObj.params,
                type: urlPropObj.type,
                tag: urlPropObj.tag,
                preferenceIdx: urlPropObj.preferenceIdx,
                valueType: urlPropObj.valueType,
                value: urlPropObj.value,
                url: new URL(urlPropObj.value as string),
            }
            urlPropList.push(urlObj);
        }
        if (urlPropList.length > 0) {
            return Ok(urlPropList);
        }
        return Ok(undefined);
    }

    getVersion(prop: Property | Property[]): Result<string | undefined, string> {
        return Ok(prop.valueOf() as string);
    }

    hasAttr(attr: string): boolean {
        return this.vCard.data.hasOwnProperty(attr);
    }
}