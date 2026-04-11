import { TypedVCardImpl } from '../src/TypedVCardImpl';

const VALID_VCARD_CRLF =
	"BEGIN:VCARD\r\n" +
	"VERSION:3.0\r\n" +
	"N:Doe;John;;;\r\n" +
	"FN:John Doe\r\n" +
	"END:VCARD\r\n";

const VALID_VCARD_LF =
	"BEGIN:VCARD\n" +
	"VERSION:3.0\n" +
	"N:Doe;John;;;\n" +
	"FN:John Doe\n" +
	"END:VCARD\n";

const VALID_VCARD_CR =
	"BEGIN:VCARD\r" +
	"VERSION:3.0\r" +
	"N:Doe;John;;;\r" +
	"FN:John Doe\r" +
	"END:VCARD\r";

const VALID_VCARD_MIXED_LF =
	"BEGIN:VCARD\r\n" +
	"VERSION:3.0\r\n" +
	"N:Doe;John;;;\n" +
	"FN:John Doe\r\n" +
	"END:VCARD\r\n";

const VALID_VCARD_MIXED_CR =
	"BEGIN:VCARD\r\n" +
	"VERSION:3.0\r\n" +
	"N:Doe;John;;;\r" +
	"FN:John Doe\r\n" +
	"END:VCARD\r\n";

const MULTIPLE_VCARDS_CRLF =
	"BEGIN:VCARD\r\n" +
	"VERSION:3.0\r\n" +
	"N:Doe;John;;;\r\n" +
	"FN:John Doe\r\n" +
	"END:VCARD\r\n" +
	"BEGIN:VCARD\r\n" +
	"VERSION:3.0\r\n" +
	"N:Smith;Jane;;;\r\n" +
	"FN:Jane Smith\r\n" +
	"END:VCARD\r\n";

const MULTIPLE_VCARDS_LF =
	"BEGIN:VCARD\n" +
	"VERSION:3.0\n" +
	"N:Doe;John;;;\n" +
	"FN:John Doe\n" +
	"END:VCARD\n" +
	"BEGIN:VCARD\n" +
	"VERSION:3.0\n" +
	"N:Smith;Jane;;;\n" +
	"FN:Jane Smith\n" +
	"END:VCARD\n";

describe('vCard line ending normalization', () => {

	test('parse vCard with CRLF line endings', () => {
		const typedVCard = new TypedVCardImpl(VALID_VCARD_CRLF);
		expect(typedVCard.getNumberOfVCards()).toBe(1);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(1);
		expect(cards[0].name?.familyName).toBe('Doe');
	});

	test('normalize and parse vCard with bare LF line endings', () => {
		const typedVCard = new TypedVCardImpl(VALID_VCARD_LF);
		expect(typedVCard.getNumberOfVCards()).toBe(1);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(1);
		expect(cards[0].name?.familyName).toBe('Doe');
	});

	test('normalize and parse vCard with bare CR line endings', () => {
		const typedVCard = new TypedVCardImpl(VALID_VCARD_CR);
		expect(typedVCard.getNumberOfVCards()).toBe(1);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(1);
		expect(cards[0].name?.familyName).toBe('Doe');
	});

	test('normalize and parse vCard with mixed CRLF and bare LF', () => {
		const typedVCard = new TypedVCardImpl(VALID_VCARD_MIXED_LF);
		expect(typedVCard.getNumberOfVCards()).toBe(1);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(1);
		expect(cards[0].name?.familyName).toBe('Doe');
	});

	test('normalize and parse vCard with mixed CRLF and bare CR', () => {
		const typedVCard = new TypedVCardImpl(VALID_VCARD_MIXED_CR);
		expect(typedVCard.getNumberOfVCards()).toBe(1);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(1);
		expect(cards[0].name?.familyName).toBe('Doe');
	});

	test('parse multiple vCards with CRLF line endings', () => {
		const typedVCard = new TypedVCardImpl(MULTIPLE_VCARDS_CRLF);
		expect(typedVCard.getNumberOfVCards()).toBe(2);
	});

	test('normalize and parse multiple vCards with bare LF line endings', () => {
		const typedVCard = new TypedVCardImpl(MULTIPLE_VCARDS_LF);
		expect(typedVCard.getNumberOfVCards()).toBe(2);
		const cards = typedVCard.getVCardsV3_0();
		expect(cards.length).toBe(2);
		expect(cards[0].name?.familyName).toBe('Doe');
		expect(cards[1].name?.familyName).toBe('Smith');
	});
});
