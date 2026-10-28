# Agent.md — typed-vcard

Distilled working knowledge for coding agents and new contributors. Read this before touching
the code. Keep it updated when behaviour described here changes.

## What this repository is

A small TypeScript library that wraps the output of the `vcf` parser
(https://codeberg.org/jhermsmeier/node-vcf) in strongly-typed, version-aware objects. It parses
and normalizes vCard 2.1 / 3.0 / 4.0 into readonly TypeScript shapes. It does **not** serialize
back to vCard text.

Its only known consumer is the sibling repository `../obsidian-pim-integration`, which depends on
it via `"typed-vCard": "file:../typed-vcard"` and imports source files directly
(`typed-vcard/src/...`). There is no published npm package and no `index.ts`; the `main.js` in
`package.json` does not exist.

## Layout

```
src/
  TypedVCard.ts / TypedVCardImpl.ts   Entry point: parse string | vCard | vCard[], bucket by version
  vCardTsBuilder.ts                   Picks the Impl class based on VERSION
  vCardTsTypes.ts                     Public value types + enums (vCardProperty, eMail, telepone, ...)
  vCardTsCommon.ts / ...CommonImpl.ts Fields shared by all versions and their getters (630 lines, the core)
  vCardTs2_1.ts / ...2_1Impl.ts       2.1-only fields (agent, label, mailer, profile, sort-string)
  vCardTs3_0.ts / ...3_0Impl.ts       3.0-only fields (class, impp, nickname, prodid, ...)
  vCardTs4_0.ts / ...4_0Impl.ts       4.0-only fields (anniversary, gender, kind, lang, related, xml, ...)
  vCardTsOutlook*.ts                  2.1 subclass for Outlook exports (adds nickname)
  vCardTsMacAddressBook*.ts           3.0 subclass for Apple Address Book (no extra fields yet)
  vCardTsUtils.ts                     convertProperty(), unescaping, TYPE/PREF/VALUE param extraction
tests/
  *.test.ts                           One Jest file per fixture, plus line-ending tests
  files/*.vcf                         Fixtures: RFC examples, Outlook 2.1, Mac Address Book 3.0, FullContact 4.0
```

## Core design

- **Interface + Impl pairs.** Every version has a readonly interface (`vCardTs3_0`) and a class
  (`vCardTs3_0Impl`) that extends `vCardTsCommonImpl`. Consumers should type against the
  interfaces.
- **Everything is computed in the constructor.** `vCardTsCommonImpl` calls
  `this.getEntry("<vcf key>", this.getXxx)` for every property. `getEntry` looks the key up on the
  `vcf` object, calls the getter with `Property | Property[]`, and stores the unwrapped value. A
  getter that returns `Err` sets the private `vCardValid = false` and leaves the field
  `undefined`. **Errors are silent**: `vCardValid` is never exposed, so a malformed property just
  disappears. Do not rely on exceptions for validation.
- **Result types, not throws.** All getters return `Result<T | undefined, string>` from
  `oxide.ts`. `Ok(undefined)` means "property absent". Follow this pattern for new getters.
- **`utils.convertProperty(prop)`** is the common first step: it calls `prop.toJSON()`, reads
  `type`, `pref`, `value` params, derives `tag` (`work` / `home`, errors if both present),
  `preferenceIdx`, `valueType`, and unescapes `\n \, \: \\ \;`. It returns `Err` on an empty
  value, which fails the whole property group (e.g. one empty EMAIL drops all emails).
- **Multi-valued properties** (ADR, EMAIL, TEL, ORG, PHOTO, TITLE, URL, GEO, IMPP, LANG, ...) are
  normalized with `prop instanceof Property ? [prop] : prop` and returned as arrays.
- **Line endings.** `TypedVCardImpl.parseString` normalizes any mix of CR / LF / CRLF to CRLF
  before calling `vCard.parse`, because Outlook 2.1 exports use bare LF. This is the only
  behavioural change since the initial commit (`git log`).
- **Dates.** BDAY and ANNIVERSARY go through `date-fns-tz` `toDate`; REV through `parseISO`.
  BDAY falls back to the raw string for `--MMDD` partial dates and `VALUE=text`.

## Known quirks and bugs (do not "fix" silently; check tests first)

- `vCardTsBuilder.buildvCardTs()` calls `buildvCardTs4_0()` for **version 3.0** cards, so
  `TypedVCardImpl.getVCardsV3_0()` actually holds `vCardTs4_0Impl` instances. Tests construct the
  Impl classes directly and so never hit this path.
- `getOutlookVCards()` / `getMacAddressBookVCards()` always return `[]`; vendor detection is a
  TODO in `TypedVCardImpl.transformVCard`.
- `uid` is read from key `"uuid"` in `vCardTsCommonImpl`, not `"uid"`.
- `vCardTs4_0Impl.getRelated` builds objects but never pushes them, so `related` is always
  `undefined`.
- `getCategories` ignores its argument and re-reads from `this.vCard`.
- `getLogo` / `getSound` are marked FIXME and return `undefined` for multi-valued input.
- Typos are part of the public API: type `telepone`, field `gender.indentity`.
- Interface vs Impl field types differ in places (`addresses` is `address[]` on the interface but
  `vCardProperty[]` on `vCardTsCommonImpl`; `key` is a single object, not an array).
- Upstream `vcf` mishandles unescaped commas in vCard 2.1; a test asserts the mangled value with
  a TODO comment (`tests/vCard_2_1_John_Doe_MS_OUTLOOK.test.ts`).

## Repository scaffolding leftovers

The repo was cloned from the Obsidian plugin template. These files are **not** meaningful here:

- `manifest.json`, `versions.json`, `data.json` (manifest id is even `obsidian-pim-integration`).
- `esbuild.config.mjs` bundles `src/main.ts`, which does not exist. `npm run build` therefore
  passes `tsc -noEmit` and then fails in esbuild. Use `npx tsc -noEmit -skipLibCheck` to
  type-check.
- `tsconfig copy.json` is a byte-identical duplicate of `tsconfig.json`.
- `.gitignore` ignores `.npmrc` and `.vscode`, yet both are committed.

## Build, test, tooling

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | Node 22 is what the author uses |
| Type-check | `npx tsc -noEmit -skipLibCheck` | This is the only working part of `npm run build` |
| Tests (one shot) | `npx jest` | `npm test` runs `jest --watch` |
| Tests (single) | `npx jest tests/vCard_2_1.test.ts` | |

State as of 2026-10-28: 7 suites, 118 tests, all passing (about 40 s on this machine).

- Jest uses `ts-jest`, `testEnvironment: node`. No mocks are needed; fixtures are real files.
- Test files load a fixture with `fs.readFileSync` + `vCard.parse`, then construct the Impl
  class directly (`new vCardTs4_0Impl(vCards[0])`) and assert field by field. `lodash` is used
  only in tests for `isArray`.
- `tsconfig.json` includes `src/*.ts` and `tests/*.ts` only (no subdirectories).
- ESLint config exists (`.eslintrc`) but `eslint` is not installed as a dependency.
- Runtime dependencies used by `src/`: `vcf`, `oxide.ts`, `date-fns`, `date-fns-tz`, `tslib`.
  They are listed under `devDependencies` (except `tslib`); consumers are expected to bundle.
  `fp-ts`, `underscore`, `lodash` are listed but unused in `src/`.

## Style

- `.editorconfig` says tabs, but the code is mixed: `TypedVCard*.ts`, `vCardTsOutlook*.ts`,
  `vCardTsMacAddressBook*.ts` use tabs; everything else uses 4 spaces. Match the file you edit.
- Double quotes in `src/`, single quotes in `tests/`.
- Lower-camel type names (`vCardProperty`, `eMail`, `address`) are deliberate; do not rename.
- Error strings follow the shape `` `VCard is invalid (${prop}: ${reason})` ``.

## When adding or changing a property

1. Add or adjust the type in `src/vCardTsTypes.ts` and the readonly field in the matching
   interface (`vCardTsCommon.ts` or a version file).
2. Add the field and a `getXxx(prop: Property | Property[])` getter in the Impl, wire it with
   `this.getEntry("<lower-case vcf key>", this.getXxx)` in the constructor.
3. Start from `this.convertProperty(prop)` so `params`, `tag`, `preferenceIdx`, `valueType` are
   populated consistently.
4. Add assertions to the relevant fixture test, or add a fixture under `tests/files/`.
5. Update the attribute tables in `README.md` (the README is the API reference; the sibling
   plugin copies it into `docs/ContactTemplateAttributes.md`).

Open TODOs from the README: unit tests for the new `address` and `key` types.
