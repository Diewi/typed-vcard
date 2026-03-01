import { Err, Ok, Result } from "oxide.ts";
import { Property } from "vcf";

import { TypeTag, ValueType, vCardProperty } from "./vCardTsTypes";

export function convertProperty(prop: Property): Result<vCardProperty, string> {
    const propJson = prop.toJSON();
    // let tag: TypeTag | undefined = undefined;

    const type = propJson[1]["type"] === ""
        ? undefined
        : (typeof propJson[1]["type"] === "string" ? [propJson[1]["type"]] : propJson[1]["type"] );
    const tagRes = getTag(type);
    if (tagRes.isErr()) {
        return tagRes;
    }
    const tag = tagRes.unwrap();

    const valueTypeRes = getSingleParam("value", propJson);
    if (valueTypeRes.isErr()) {
        return valueTypeRes;
    }
    const valueType = getValueType(valueTypeRes.unwrap());


    const prefIdxExtracted: string | string[] | undefined = propJson[1]["pref"]
    if (Array.isArray(prefIdxExtracted)) {
        return Err(`VCard is invalid (${propJson[0]}: Preference index may not be an array`)
    }
    let prefIdx: number | undefined = undefined;
    if (prefIdxExtracted !== undefined) {
        prefIdx = +prefIdxExtracted;
    }

    let value: string | string[] | undefined = propJson[3] ? propJson[3] : undefined;
    if (!value || value === "") {
        return Err(`VCard is invalid (${propJson[0]}: Value may not be empty`)
    } else {
        value = Array.isArray(value) ?
                    (value as string[]).map(v => getUnescapedString(v))
                    : getUnescapedString(value);
    }


    return Ok({
        params: propJson[1],
        type: type,
        tag: tag,
        preferenceIdx: prefIdx,
        valueType: valueType,
        value: value
    });
}

function getSingleParam(paramKey: string, propJson: any): Result<string | undefined, string> {
    const typeProp = propJson[1][paramKey];
    if (!typeProp) {
        return Ok(undefined);
    }

    if (Array.isArray(typeProp)) {
        // Two values exists --> Invalid vCard
        return Err(`VCard is invalid (${propJson[0]}: Found Tags HOME and WORK`)
    }
    return Ok(typeProp as string);
}

export function getStringFromParams(vCardProp: vCardProperty, propName: string, paramKey: string): Result<string | undefined, string> {
    const paramStr = vCardProp.params[paramKey];
    if (Array.isArray(paramStr)) {
        return Err(`Invalid media type format: Parameter value ${paramKey} of field"
            + "${propName} is present multiple times.`);
    }
    return paramStr ? (paramStr.length > 0 ? Ok(paramStr): Ok(undefined)) : Ok(undefined);
}

export function getUnescapedString(value: string): string {
    return value.replace(/\\n/g, "\n")
        .replace(/\\,/g, ",")
        .replace(/\\:/g, ":")
        .replace(/\\\\/g, "\\")
        .replace(/\\;/g, ";")
        .trim();
}

function getTag(type: string | string [] | undefined): Result<TypeTag | undefined, string> {
    const typeArr = Array.isArray(type) ? type : [type];
    const tagTypeList: TypeTag[] | undefined = typeArr?.map(typeLocal => {
        switch (typeLocal) {
            case "home":
                return TypeTag.HOME;
            case "work":
                return TypeTag.WORK;
            default:
                return undefined;
        }
    }).filter(typeLocal => {return typeLocal !== undefined;}) as TypeTag[];
    if (tagTypeList && tagTypeList?.length > 1) {
        return Err(`VCard is invalid: Multiple tpye tags found: ${tagTypeList}`);
    }

    return Ok(tagTypeList?.[0]);
}

function getValueType(type: string | undefined): ValueType | undefined {
    if (!type) {
        return undefined;
    }
    switch (type.toLowerCase()) {
        case "text":
            return ValueType.TEXT;
        case "uri":
            return ValueType.URI;
        case "date":
            return ValueType.DATE;
        case "time":
            return ValueType.TIME;
        case "date-time":
            return ValueType.DATE_TIME;
        case "date-and-or-time":
            return ValueType.DATE_AND_OR_TIME;
        case "timestamp":
            return ValueType.TIMESTAMP;
        case "boolean":
            return ValueType.BOOLEAN;
        case "integer":
            return ValueType.INTEGER;
        case "float":
            return ValueType.FLOAT;
        case "utc-offset":
            return ValueType.UTC_OFFSET;
        case "language-tag":
            return ValueType.LANGUAGE_TAG;
        default:
            return undefined;
    }
}

