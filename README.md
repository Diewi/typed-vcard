# Typed vCard — Technical overview

This library provides a strongly-typed TypeScript representation of vCard data used by
downstream tools and templates. It is intentionally small and focuses on a stable type model
(`src/vCardTsTypes.ts`) that normalizes common vCard properties (2.1 / 3.0 / 4.0) into easy-to-use
structures for templates and backends.

## Status
- Parsing helpers and normalization are implemented; the type model is the primary public API.
- Generation (serializing the typed shapes back to vCard text) is not the library's focus yet.

## Why use this library
- Strongly-typed access to vCard properties (names, emails, addresses, telephones, photos, etc.).
- Normalization between vCard versions so templates and UI code can rely on a consistent shape.
- Small surface area: types and lightweight utilities suitable for bundling into apps or plugins.

## Limitations
- Extended and non-standard properties (for example `X-*` attributes) are preserved as raw
  parameter/value mappings and are not normalized into dedicated typed fields.
- Application-specific metadata is not typed and is only reachable via raw params or string
  mappings.
- The library focuses on parsing and normalization into typed shapes — it does not currently
  provide serialization (converting the typed model back to vCard text).
- Address parsing/normalization is incomplete: some address formats (especially from vCard 2.1
  exporters) may be flattened and require downstream parsing or fallbacks.
- Photo handling is limited to embedded base64 values and simple URI references; streaming or
  incremental binary handling for very large images is not implemented.
- Validation is intentionally lenient: malformed or non-conformant vCards are parsed into
  best-effort shapes rather than rejected; if you need strict validation, add explicit checks.
- Timezone, locale and complex date/time variants may require additional downstream
  normalization (the library provides value-type hints but not full i18n/date parsing).
- Performance: the module is not optimized for very large bulk imports. For large collections,
  prefer a streaming parser and incremental processing.
- Test coverage is limited for some edge cases and vCard variants; add unit tests when extending
  parsers or normalization rules.

## Quick links
- Types: [src/vCardTsTypes.ts](src/vCardTsTypes.ts)
- Template attribute reference: [docs/ContactTemplateAttributes.md](docs/ContactTemplateAttributes.md)

## Attribute availability by vCard version

The table below shows typical availability of common attributes across vCard versions. Use `✓`
for widely supported, `~` for partial/conditional support (present but not always populated or
componentized), and `-` for generally not used in that version. Availability may still vary by
exporter or backend implementation.

| Attribute (logical) | vCard 2.1 | vCard 3.0 | vCard 4.0 | Notes |
|---|:---:|:---:|:---:|---|
| `name.familyName`, `name.givenName` (N) | ✓ | ✓ | ✓ | Core name components |
| `name.formatted` (FN) | ✓ | ✓ | ✓ | Formatted full name |
| `emails[]` (EMAIL) | ✓ | ✓ | ✓ | Email addresses; later versions allow more params (TYPE, PREF) |
| `telephones[]` (TEL) | ✓ | ✓ | ✓ | Phone numbers with TYPE in 3.0/4.0 |
| `organization[]` (ORG) | ✓ | ✓ | ✓ | 2.1 often a single string; 3.0/4.0 allow units/components |
| `title[]` (TITLE) | ✓ | ✓ | ✓ | Role/position text |
| `addresses[]` (ADR) | ✓ | ✓ | ✓ | ADR exists in all; structured components more reliable in 3.0/4.0 |
| `addresses` components (street, city, region, postalCode, country) | ~ | ✓ | ✓ | Components may be flattened in 2.1 exports |
| `photo` / `logo` (PHOTO) | ✓ | ✓ | ✓ | Binary or URI-based photos; params differ across versions |
| `uid` (UID) | ~ | ✓ | ✓ | UID optional in 2.1 exports but common in later versions |
| `url[]` (URL) | ~ | ✓ | ✓ | URL field more common in 3.0/4.0 |
| `note` (NOTE) | ✓ | ✓ | ✓ | Free-text note |
| `birthday` (BDAY) | ~ | ✓ | ✓ | Format handling improved in later versions |
| `categories[]` (CATEGORIES) | ~ | ✓ | ✓ | Tagging / categories better-supported in 3.0/4.0 |
| `geo` (GEO) | ~ | ✓ | ✓ | Geographic coordinates supported in later versions |
| `key` (KEY) | ~ | ✓ | ✓ | Public key entries; limited in 2.1 exports |
| `sound` (SOUND) | ~ | ✓ | ✓ | Pronunciation/sound data; rarely used in 2.1 |
| `revision` (REV) | ~ | ✓ | ✓ | Revision timestamp more consistently present in 3.0/4.0 |
| `impp` / messaging (IMPP) | - | ✓ | ✓ | IMPP is introduced/standardized in 3.0+ |
| `version` (vCard version string) | ✓ | ✓ | ✓ | Present to indicate the source vCard version |

## Attribute Reference

The table below maps the logical attribute paths used by templates and consumers to the
TypeScript types exposed in `src/vCardTsTypes.ts`. Use these types directly when consuming
normalized vCard objects.

| Attribute Path | TS type | vCard field(s) | Notes / usage example |
|---|---:|---|---|
| `addresses[]` | `address[]` | ADR | Structured address entries (may be flattened for v2.1) |
| `addresses[].fullAddress` | `string` | ADR (formatted) | Pre-formatted address string |
| `addresses[].street` / `locality` / `region` / `postalCode` / `country` | `string` | ADR components | Use with fallbacks for v2.1 exporters |
| `birthday` | `string | Date` | BDAY | Parsable date string or Date object |
| `categories[]` | `string[]` | CATEGORIES | Tags / categories |
| `emails[]` | `eMail[]` | EMAIL | `eMail` extends `vCardProperty` with `addressType?: MailType` |
| `emails[].value` | `string` | EMAIL | Raw email address |
| `gender` | `gender` | GENDER | Gender property with optional `sex` / `indentity` fields |
| `emails[].addressType` | `MailType` | EMAIL params | Enum: `internet` / `x400` |
| `telephones[]` | `telepone[]` | TEL | `telepone` has `valueType`, `valueUri?`, `device?`, `capabilities` |
| `telephones[].value` | `string` | TEL | Number string or URI |
| `telephones[].valueUri` | `valueUri` | TEL | `{uri:string, mediatype?:MediaType}` |
| `telephones[].device` | `phoneDevice` | TEL | Enum: `tel`, `cell`, `fax`, `pager`, `textphone` |
| `telephones[].capabilities` | `phoneCapabilities[]` | TEL | Enum flags: `voice`, `video`, `text` |
| `geo` | `GeoCoordinates[]` | GEO | Contains numeric `latitude` / `longitude` alongside base props |
| `geo.latitude` / `geo.longitude` | `number` | GEO | Decimal coordinates |
| `impp[]` | `impp[]` | IMPP | Messaging URIs (valueType usually `uri`) |
| `key` | `key[]` | KEY | Public key entries; may include `keyUri` |
| `key.keyUri` | `valueUri` | KEY | Key URI structure |
| `logo` / `photo[]` | `photo | photo[]` | LOGO / PHOTO | `photo` includes `mediaType?: MediaType`, `encoding?: string` |
| `name` | `name` | N | Structured name components: `familyName`, `givenName`, etc. |
| `name.formatted` | `string` | FN | Formatted full name |
| `note` | `string` | NOTE | Free-text notes |
| `organization[]` | `organization[]` | ORG | `organizationName` + optional `organizationUnit[]` |
| `role` | `string` | ROLE | Job/role string |
| `revision` | `string | Date` | REV | Revision timestamp |
| `source` | `URL` | SOURCE | Source URI for vCard |
| `title[]` | `string[]` | TITLE | Job/title entries (array) |
| `timeZone` | `string` | TZ | Time zone identifier |
| `uid` | `string` | UID | Unique identifier for contact |
| `url[]` | `url[]` | URL | Homepage / links |
| `version` | `string` | VERSION | vCard version string (2.1 / 3.0 / 4.0) |

### Base property helpers (present on most values)

| Path | TS type | Notes |
|---|---:|---|
| `*.params` | `Record<string,string|string[]>` | Raw param map (TYPE, PREF, etc.) |
| `*.type` | `string[]` | Raw TYPE parameter values |
| `*.tag` | `TypeTag` | Normalized convenience tag (`work`/`home`) |
| `*.preferenceIdx` | `number` | Numeric preference index (PREF) |
| `*.valueType` | `ValueType` | Hint about stored value (text/uri/date/...) |
| `*.value` | `string | string[]` | The raw value or component array |

### Enums & helper types (use in signatures)

| Symbol | Values / shape |
|---|---|
| `ValueType` | `TEXT, URI, DATE, TIME, DATE_TIME, TIMESTAMP, BOOLEAN, INTEGER, FLOAT, UTC_OFFSET, LANGUAGE_TAG` |
| `MailType` | `internet, x400` |
| `TypeTag` | `work, home` |
| `phoneDevice` | `tel, cell, fax, pager, textphone` |
| `phoneCapabilities` | `voice, video, text` |
| `relatedType` | `contact, friend, spouse, colleague, ...` |

See `src/vCardTsTypes.ts` for the canonical TypeScript definitions and `docs/ContactTemplateAttributes.md`
for template-focused examples and rendering recipes.

### Other exported types

The module exports a few additional helper and base types that are useful when writing code
against the typed model.

| Symbol | TS type / notes |
|---|---|
| `vCardProperty` | Base property shape for most fields: `{ params: Record<string, string|string[]>, type?: string[], tag?: TypeTag, preferenceIdx?: number, valueType?: ValueType, value: string | string[] }` |
| `MediaType` | `{ type: string; subType?: string; params?: Record<string,string> }` — used for `photo.mediaType` and `valueUri.mediatype` |
| `valueUri` | `{ uri: string; mediatype?: MediaType }` — structured URI objects used for phone/key values |
| `phoneDeviceUnion` | Union of `phoneDevice` enum values (convenience typedef) |
| `phoneCapabilitiesUnion` | Union of `phoneCapabilities` enum values (convenience typedef) |
| `vCardTsError` | Custom Error subclass thrown by the library on parse/validation issues |


## Install & build (developer)
1. Install dependencies:

```sh
npm install
```

2. Build TypeScript (project provides a `build` script used by repo tooling):

```sh
npm run build
```

## Project layout (relevant files)
- `src/` — implementation and helpers (parsers, normalizers)
- `src/vCardTsTypes.ts` — exported type definitions and enums (primary API)
- `docs/ContactTemplateAttributes.md` — user-facing attribute reference used by templates

## Example: using the types in TypeScript

```ts
import { vCardProperty, eMail, GeoCoordinates } from './src/vCardTsTypes';

// A parsed email entry (conforms to `eMail`)
const email: eMail = {
    params: { TYPE: ['work'] },
    tag: 'work',
    value: 'jane.doe@example.com'
};

// Geo coordinates example
const geo: GeoCoordinates = {
    params: {},
    value: '52.5200,13.4050',
    latitude: 52.52,
    longitude: 13.405
};
```

## Parsing flow (integration guidance)
This library focuses on the typed representation. If you use a text parser (for example
`vcf/node-vcf`), feed the parser result into your normalizer that maps raw vCard fields into the
typed shapes defined in `src/vCardTsTypes.ts`.

## API surface and mapping notes
- Most vCard fields are represented as arrays in the typed model (`emails[]`, `telephones[]`,
  `addresses[]`, `url[]`, etc.). Each array element is a `vCardProperty`-derived object and may
  include convenience fields such as `tag` (normalized TYPE), `preferenceIdx` (PREF), or
  `valueType` (hints like `uri`, `date`, `text`).

## Testing
- Jest tests can be run by execurtin:

```sh
npm test
```

## Contributing
- New types should be added to `src/vCardTsTypes.ts` and documented in the Readme.md.

## TODO
- Create Unit tests for the new address type
- Create Unit tests for the new key type

## License & references
- See repository `LICENSE` and `LICENSE-3rdparty` for license information.
- Downstream parsing helpers may rely on `vcf/node-vcf`: https://codeberg.org/jhermsmeier/node-vcf

## Contact
- For questions about shape or to request additional fields, open an issue in this repository.

