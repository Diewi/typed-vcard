import { MailType, TypeTag } from '../src/vCardTsTypes';
import { vCardTs3_0 } from '../src/vCardTs3_0';
import { vCardTs3_0Impl } from '../src/vCardTs3_0Impl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';

const vCardPath = 'tests/files/rfc2426-example.vcf';
let vCards3_0: vCard[];

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCards3_0 = vCard.parse(vCardData);
});

describe('Load vCards in vCardTs', () => {
  test('vCardTs 3.0 construction for all', () => {
    vCards3_0.forEach(vc => {
      const vCardTs3_0 = new vCardTs3_0Impl(vc);
      expect(vCardTs3_0).toBeDefined();
    });
  });
});

describe('Test vCard3_0 properties (rfc2426-example.vcf)', () => {
  let vCardTsFrank: vCardTs3_0;
  let vCardTsTim: vCardTs3_0;

  beforeAll(() => {
    vCardTsFrank = new vCardTs3_0Impl(vCards3_0[0]);
    vCardTsTim = new vCardTs3_0Impl(vCards3_0[1]);
  });

  describe('Frank Dawson', () => {
    test('formatted name', () => {
      expect(vCardTsFrank.formattedName).toEqual('Frank Dawson');
    });

    test('organization', () => {
      expect(vCardTsFrank.organization).toBeDefined();
      if (vCardTsFrank.organization) {
        const org = vCardTsFrank.organization[0];
        expect(org.params).toBeDefined();
        expect(org.value).toEqual("Lotus Development Corporation");
        expect(org.organizationName).toEqual("Lotus Development Corporation");
        expect(org.organizationUnit).toBeUndefined();
      }
    });

    test('addresses', () => {
      expect(_.isArray(vCardTsFrank.addresses)).toBeTruthy();
      if (_.isArray(vCardTsFrank.addresses)) {
        expect(vCardTsFrank.addresses.length).toEqual(1);
        const addrWork = vCardTsFrank.addresses[0];
        expect(addrWork.params['type']).toEqual(['work', 'postal', 'parcel']);
        expect(addrWork.tag).toEqual(TypeTag.WORK);
        expect(addrWork.value).toEqual([
          "", "", "6544 Battleford Drive", "Raleigh", "NC", "27613-3502", "U.S.A."
        ]);
      }
    });

    test('telephones', () => {
      expect(_.isArray(vCardTsFrank.telephones)).toBeTruthy();
      if (_.isArray(vCardTsFrank.telephones)) {
        expect(vCardTsFrank.telephones.length).toEqual(2);
        const telWork = vCardTsFrank.telephones[0];
        expect(telWork.params['type']).toEqual(['voice', 'msg', 'work']);
        expect(telWork.tag).toEqual(TypeTag.WORK);
        expect(telWork.value).toEqual('+1-919-676-9515');

        const telFax = vCardTsFrank.telephones[1];
        expect(telFax.params['type']).toEqual(['fax', 'work']);
        expect(telFax.tag).toEqual(TypeTag.WORK);
        expect(telFax.value).toEqual('+1-919-676-9564');
      }
    });

    test('emails', () => {
      expect(_.isArray(vCardTsFrank.emails)).toBeTruthy();
      if (_.isArray(vCardTsFrank.emails)) {
        expect(vCardTsFrank.emails.length).toEqual(2);
        const emailWork = vCardTsFrank.emails[0];
        expect(emailWork.params['type']).toEqual(['internet', 'pref']);
        expect(emailWork.preferenceIdx).toEqual(1);
        expect(emailWork.addressType).toEqual(MailType.internet);
        expect(emailWork.value).toEqual("Frank_Dawson@Lotus.com");


        const emailPrivate = vCardTsFrank.emails[1];
        expect(emailPrivate.params['type']).toEqual('internet');
        expect(emailPrivate.preferenceIdx).toEqual(undefined);
        expect(emailPrivate.addressType).toEqual(MailType.internet);
        expect(emailPrivate.value).toEqual("fdawson@earthlink.net");
      }
    });

    test('url', () => {
      expect(_.isArray(vCardTsFrank.url)).toBeTruthy();
      if (_.isArray(vCardTsFrank.url)) {
        expect(vCardTsFrank.url.length).toEqual(1);
        const url = vCardTsFrank.url[0];
        expect(url.value).toEqual("http://home.earthlink.net/~fdawson");
      }
    });

    test('version', () => {
      expect(vCardTsFrank.version).toEqual('3.0');
    });
  });

  describe('Tim Howes', () => {
    test('formatted name', () => {
      expect(vCardTsTim.formattedName).toEqual('Tim Howes');
    });

    test('organization', () => {
      expect(vCardTsTim.organization).toBeDefined();
      if (vCardTsTim.organization) {
        const org = vCardTsTim.organization[0];
        expect(org.params).toBeDefined();
        expect(org.value).toEqual("Netscape Communications Corp.");
        expect(org.organizationName).toEqual("Netscape Communications Corp.");
        expect(org.organizationUnit).toBeUndefined();
      }
    });

    test('addresses', () => {
      expect(_.isArray(vCardTsTim.addresses)).toBeTruthy();
      if (_.isArray(vCardTsTim.addresses)) {
        expect(vCardTsTim.addresses.length).toEqual(1);
        const addrWork = vCardTsTim.addresses[0];
        expect(addrWork.params['type']).toEqual('work');
        expect(addrWork.tag).toEqual(TypeTag.WORK);
        expect(addrWork.value).toEqual([
          "", "", "501 E. Middlefield Rd.", "Mountain View", "CA", "94043", "U.S.A."
        ]);
      }
    });

    test('telephones', () => {
      expect(_.isArray(vCardTsTim.telephones)).toBeTruthy();
      if (_.isArray(vCardTsTim.telephones)) {
        expect(vCardTsTim.telephones.length).toEqual(2);
        const telWork = vCardTsTim.telephones[0];
        expect(telWork.params['type']).toEqual(['voice', 'msg', 'work']);
        expect(telWork.tag).toEqual(TypeTag.WORK);
        expect(telWork.value).toEqual('+1-415-937-3419');

        const telFax = vCardTsTim.telephones[1];
        expect(telFax.params['type']).toEqual(['fax', 'work']);
        expect(telFax.tag).toEqual(TypeTag.WORK);
        expect(telFax.value).toEqual('+1-415-528-4164');
      }
    });

    test('emails', () => {
      expect(_.isArray(vCardTsTim.emails)).toBeTruthy();
      if (_.isArray(vCardTsTim.emails)) {
        expect(vCardTsTim.emails.length).toEqual(1);
        const emailWork = vCardTsTim.emails[0];
        expect(emailWork.params['type']).toEqual('internet');
        expect(emailWork.preferenceIdx).toEqual(undefined);
        expect(emailWork.addressType).toEqual(MailType.internet);
        expect(emailWork.value).toEqual("howes@netscape.com");
      }
    });

    test('url', () => {
      expect(vCardTsTim.url).toBeUndefined();
    });

    test('version', () => {
      expect(vCardTsTim.version).toEqual('3.0');
    });
  });
});