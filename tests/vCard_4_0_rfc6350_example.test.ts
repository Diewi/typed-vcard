import { phoneDevice, TypeTag } from '../src/vCardTsTypes';
import { vCardTs4_0 } from '../src/vCardTs4_0';
import { vCardTs4_0Impl } from '../src/vCardTs4_0Impl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';
import { toDate } from 'date-fns-tz';

// This test covers all vCards in the rfc6350-example.vcf file

const vCardPath = 'tests/files/rfc6350-example.vcf';
let vCards4_0: vCard[];

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCards4_0 = vCard.parse(vCardData);
});

describe('Load vCards in vCardTs', () => {
  test('vCardTs 4.0 construction for all', () => {
    vCards4_0.forEach(vc => {
      const vCardTs4_0 = new vCardTs4_0Impl(vc);
      expect(vCardTs4_0).toBeDefined();
    });
  });
});

describe('Test vCard4_0 properties (rfc6350-example.vcf)', () => {
  let vCardTs: vCardTs4_0;

  beforeAll(() => {
    vCardTs = new vCardTs4_0Impl(vCards4_0[0]);
  });

  describe('Simon Perreault', () => {
    test('formatted name', () => {
      expect(vCardTs.formattedName).toEqual('Simon Perreault');
    });

    test('addresses', () => {
      expect(_.isArray(vCardTs.addresses)).toBeTruthy();
      if (_.isArray(vCardTs.addresses)) {
        expect(vCardTs.addresses.length).toEqual(1);

        {
          const addr = vCardTs.addresses[0];
          expect(addr.params['type']).toEqual('work');
          expect(addr.tag).toEqual(TypeTag.WORK);
          expect(addr.value).toEqual([
            '', 'Suite D2-630', '2875 Laurier', 'Quebec', 'QC', 'G1V 2M2', 'Canada'
          ]);
        }
      }
    });

    // TODO: Add test for anniversary
    test('anniversary', () => {
      expect(vCardTs.anniversary).toBeDefined();
      const anni = toDate("20090808T1430-0500");
      expect(vCardTs.anniversary).toEqual(anni);
    });

    // TODO: Create test file for bday with Value=text:circa 1800
    test('birthdate', () => {
      expect(typeof vCardTs.birthdate === 'string').toBeTruthy();
      expect(vCardTs.birthdate as string).toEqual("--0203");
    });

    test('emails', () => {
      expect(_.isArray(vCardTs.emails)).toBeTruthy();
      if (_.isArray(vCardTs.emails)) {
        expect(vCardTs.emails.length).toEqual(1);
        const email = vCardTs.emails[0];
        expect(email.value).toEqual('simon.perreault@viagenie.ca');
      }
    });

    test('fn', () => {
      expect(vCardTs.formattedName).toBeDefined();
      expect(vCardTs.formattedName).toEqual('Simon Perreault');
    });

    test('name', () => {
      expect(vCardTs.name).toBeDefined();
      if (vCardTs.name) {
        expect(vCardTs.name.familyName).toEqual('Perreault');
        expect(vCardTs.name.givenName).toEqual('Simon');
        expect(vCardTs.name.additionalName).toBe("");
        expect(vCardTs.name.honorificPrefix).toBe("");
        expect(vCardTs.name.honorificSuffix).toEqual('ing. jr,M.Sc.');
      }
    });

    test('key', () => {
      expect(vCardTs.key).toBeDefined();

      if (_.isArray(vCardTs.key)) {
        expect(vCardTs.key.length).toEqual(1);
        {
          const keyWork = vCardTs.key[0];
          expect(keyWork['type']).toEqual("work");
          expect(keyWork.tag).toEqual(TypeTag.WORK);
          expect(keyWork.valueType).toEqual("uri");
          expect(keyWork.value).toEqual('http://www.viagenie.ca/simon.perreault/simon.asc');
        }
      }
    });

    test('gender', () => {
      expect(vCardTs.gender).toBeDefined();
      expect(vCardTs.gender?.sex).toEqual('M');
      expect(vCardTs.gender?.indentity).toBeUndefined();
    });

    test('geo', () => {
      expect(_.isArray(vCardTs.geo)).toBeTruthy();
      if (_.isArray(vCardTs.geo)) {
        expect(vCardTs.geo.length).toEqual(1);
        const geo = vCardTs.geo[0];
        const geoParams = geo.params;
        expect(geoParams['type']).toEqual("work");
        expect(geo.tag).toEqual(TypeTag.WORK);
        expect(geo.value).toEqual('geo:46.772673,-71.282945');
        expect(geo.latitude).toEqual(46.772673);
        expect(geo.longitude).toEqual(-71.282945);
      }
    });

    // TODO: Define Language as a an array of Language objects with language and preferenceIdx
    test('language', () => {
      expect(_.isArray(vCardTs.language)).toBeTruthy();
      if (_.isArray(vCardTs.language)) {
        expect(vCardTs.language.length).toEqual(2);
        const lang = vCardTs.language[0];
        expect(lang.value).toEqual('fr');
        expect(lang.preferenceIdx).toEqual(1);

        const lang2 = vCardTs.language[1];
        expect(lang2.value).toEqual('en');
        expect(lang2.preferenceIdx).toEqual(2);
      }
    });

    test('organization', () => {
      expect(vCardTs.organization).toBeDefined();
      if (vCardTs.organization) {
        const org = vCardTs.organization[0];
        expect(org.params['type']).toEqual('work');
        expect(org.tag).toEqual(TypeTag.WORK);
        expect(org.value).toEqual("Viagenie");
        expect(org.organizationName).toEqual("Viagenie");
        expect(org.organizationUnit).toBeUndefined()
      }
    });

    test('telephones', () => {
        expect(_.isArray(vCardTs.telephones)).toBeTruthy();
        if (_.isArray(vCardTs.telephones)) {
          expect(vCardTs.telephones.length).toEqual(2);
          const telWork = vCardTs.telephones[0];
          const telWorkParams = telWork.params;
          // FIXME: ADR, MAIL, AND TEL types need explicitly assigned keys in vcard 2.1
          expect(telWorkParams['type']).toEqual(["work", "voice"]);
          expect(telWork.type).toEqual(['work', 'voice']);
          expect(telWork.tag).toEqual(TypeTag.WORK);
          expect(telWork.capabilities).toEqual(['voice']);
          expect(telWork.preferenceIdx).toEqual(1);
          expect(telWork.value).toEqual('tel:+1-418-656-9254;ext=102')
          // TODO: Check and handle ext field

          const telWork2 = vCardTs.telephones[1];
          const telWork2Params = telWork2.params;

          expect(telWork2Params['type']).toEqual(["work", "cell", "voice", "video", "text"]);
          expect(telWork2.type).toEqual(['work', 'cell', 'voice', 'video', 'text']);
          expect(telWork2.tag).toEqual(TypeTag.WORK);
          expect(telWork2.device).toEqual(phoneDevice.CELL);
          expect(telWork2.capabilities).toEqual(['voice', 'video', 'text']);
          expect(telWork2.preferenceIdx).toEqual(undefined);
          expect(telWork2.value).toEqual('tel:+1-418-262-6501')
        }
    });

    test('timezone', () => {
      expect(vCardTs.timeZone).toBeDefined();
      expect(vCardTs.timeZone?.valueOf()).toEqual('-0500');
    });

    test('url', () => {
      expect(_.isArray(vCardTs.url)).toBeTruthy();
      if (_.isArray(vCardTs.url)) {
        expect(vCardTs.url.length).toEqual(1);

        {
          const urlHome = vCardTs.url[0];
          const urlHomeParams = urlHome.params;
          expect(urlHomeParams['type']).toEqual("home");
          expect(urlHome.tag).toEqual(TypeTag.HOME);
          expect(urlHome.value).toEqual('http://nomis80.org');
        }
      }
    });

    test('version', () => {
      expect(vCardTs.version).toEqual('4.0');
    });
  });

});