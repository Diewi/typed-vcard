import { phoneCapabilities, TypeTag, phoneDevice } from '../src/vCardTsTypes';
import { vCardTs4_0 } from '../src/vCardTs4_0';
import { vCardTs4_0Impl } from '../src/vCardTs4_0Impl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';

const vCardPath = 'tests/files/fullcontact.vcf';
let vCards: vCard[];

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCards = vCard.parse(vCardData);
});

describe('Load vCards in vCardTs (fullcontact.vcf)', () => {
  test('vCardTs 4.0 construction for all', () => {
    vCards.forEach(vc => {
      const vCardTs = new vCardTs4_0Impl(vc);
      expect(vCardTs).toBeDefined();
    });
  });
});

describe('Test vCard4_0 properties (fullcontact.vcf)', () => {
  let vCardTs: vCardTs4_0;

  beforeAll(() => {
    vCardTs = new vCardTs4_0Impl(vCards[0]);
  });

  test('addresses', () => {
        expect(_.isArray(vCardTs.addresses)).toBeTruthy();
        if (_.isArray(vCardTs.addresses)) {
          expect(vCardTs.addresses.length).toEqual(4);

          {
            const addr = vCardTs.addresses[0];
            expect(addr.params['type']).toEqual('home');
            expect(addr.tag).toEqual(TypeTag.HOME);
            expect(addr.value).toEqual([
              '', 'HomeExtended', 'HomeStreet', 'HomeCity', 'HomeState', 'HomePostal', 'HomeCountry'
            ]);
          }
          {
            const addr = vCardTs.addresses[1];
            expect(addr.params['type']).toEqual('work');
            expect(addr.tag).toEqual(TypeTag.WORK);
            expect(addr.value).toEqual([
              '', 'WorkExtended', 'WorkStreet', 'WorkCity', 'WorkState', 'WorkPostal', 'WorkCountry'
            ]);
          }
          {
            const addr = vCardTs.addresses[2];
            expect(addr.params['type']).toEqual('other');
            expect(addr.tag).toBeUndefined();
            expect(addr.value).toEqual([
              '', 'OtherExtended', 'OtherStreet', 'OtherCity', 'OtherState', 'OtherPostal', 'OtherCountry'
            ]);
          }
          {
            const addr = vCardTs.addresses[3];
            expect(addr.params['type']).toEqual('customtype');
            expect(addr.tag).toBeUndefined();
            expect(addr.value).toEqual([
              '', 'CustomExtended', 'CustomStreet', 'CustomCity', 'CustomState', 'CustomPostal', 'CustomCountry'
            ]);
          }
        }
  });

  test('birthday', () => {
    expect(vCardTs.birthdate).toBeDefined();
    // TODO: Check birthday value(s)
  });

  test('categories', () => {
    expect(vCardTs.categories).toBeDefined();
    // TODO: Check categories value(s)
  });

  test('emails', () => {
    expect(_.isArray(vCardTs.emails)).toBeTruthy();
    if (_.isArray(vCardTs.emails)) {
      expect(vCardTs.emails.length).toEqual(5);

      {
        const email = vCardTs.emails[0];
        expect(email.params['type']).toEqual('home');
        expect(email.preferenceIdx).toBeUndefined();
        expect(email.addressType).toEqual("internet");
        expect(email.tag).toEqual(TypeTag.HOME);
        expect(email.value).toEqual("home@example.com");
      }
      {
        const email = vCardTs.emails[1];
        expect(email.params['type']).toEqual('work');
        expect(email.preferenceIdx).toBeUndefined();
        expect(email.addressType).toEqual("internet");
        expect(email.tag).toEqual(TypeTag.WORK);
        expect(email.value).toEqual("work@example.com");
      }
      {
        const email = vCardTs.emails[2];
        expect(email.params['type']).toEqual('school');
        expect(email.preferenceIdx).toBeUndefined();
        expect(email.addressType).toEqual("internet");
        expect(email.value).toEqual("school@example.com");
      }
      {
        const email = vCardTs.emails[3];
        expect(email.params['type']).toEqual('other');
        expect(email.preferenceIdx).toBeUndefined();
        expect(email.addressType).toEqual("internet");
        expect(email.value).toEqual("other@example.com");
      }
      {
        const email = vCardTs.emails[4];
        expect(email.params['type']).toEqual('customtype');
        expect(email.preferenceIdx).toBeUndefined();
        expect(email.addressType).toEqual("internet");
        expect(email.value).toEqual("custom@example.com");
      }
    }
  });

  test('formatted name', () => {
    expect(typeof vCardTs.formattedName).toBe('string');
    expect(vCardTs.formattedName).toEqual('Prefix FirstName MiddleName LastName Suffix');
  });

  test('gender', () => {
      expect(vCardTs.gender).toBeDefined();
      expect(vCardTs.gender?.sex).toEqual('M');
      expect(vCardTs.gender?.indentity).toBeUndefined();
    });

  test('impp', () => {
    expect(_.isArray(vCardTs.iMPP)).toBeTruthy();
    if (_.isArray(vCardTs.iMPP)) {
      expect(vCardTs.iMPP.length).toEqual(7);

      {
        const impp = vCardTs.iMPP[0];
        expect(impp.params['xServiceType']).toEqual('GTalk');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("xmpp:gtalk");
      }
      {
        const impp = vCardTs.iMPP[1];
        expect(impp.params['xServiceType']).toEqual('Skype');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("skype:skype");
      }
      {
        const impp = vCardTs.iMPP[2];
        expect(impp.params['xServiceType']).toEqual('Yahoo');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("ymsgr:yahoo");
      }
      {
        const impp = vCardTs.iMPP[3];
        expect(impp.params['xServiceType']).toEqual('AIM');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("aim:aim");
      }
      {
        const impp = vCardTs.iMPP[4];
        expect(impp.params['xServiceType']).toEqual('Jabber');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("xmpp:jabber");
      }
      {
        const impp = vCardTs.iMPP[5];
        expect(impp.params['xServiceType']).toEqual('Other');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("other:other");
      }
      {
        const impp = vCardTs.iMPP[6];
        expect(impp.params['xServiceType']).toEqual('CustomTYPE');
        expect(impp.value).toBeDefined();
        expect(impp.value as string).toEqual("customtype:custom");
      }
    }
  });

  test('name', () => {
    expect(vCardTs.name).toBeDefined();
    if (vCardTs.name) {
      const n = vCardTs.name;
      const expName = ["LastName", "FirstName", "MiddleName", "Prefix", "Suffix"];
      expect(n.value).toEqual(expName);
      expect(n.familyName).toEqual('LastName');
      expect(n.givenName).toEqual('FirstName');
      expect(n.additionalName).toEqual('MiddleName');
      expect(n.honorificPrefix).toEqual('Prefix');
      expect(n.honorificSuffix).toEqual('Suffix');
    }
  });

  test('nickname', () => {
    expect(vCardTs.nickname).toBeDefined();
    expect(vCardTs.nickname).toEqual('NickName');
  });

  test('note', () => {
    expect(typeof vCardTs.note).toBe('string');
    expect(vCardTs.note).toEqual('Notes line 1\nNotes line 2');
  });

  test('organization', () => {
    expect(vCardTs.organization).toBeDefined();
    if (vCardTs.organization) {
      const org1 = vCardTs.organization[0];
      expect(org1.params).toBeDefined();
      expect(org1.value).toEqual("Organization1;Department1");
      expect(org1.organizationName).toEqual("Organization1");
      expect(org1.organizationUnit).toEqual(["Department1"]);
      const org2 = vCardTs.organization[1];
      expect(org2.params).toBeDefined();
      expect(org2.value).toEqual("Organization2;Department2");
      expect(org2.organizationName).toEqual("Organization2");
      expect(org2.organizationUnit).toEqual(["Department2"]);
    }
  });

  test('photo', () => {
    expect(_.isArray(vCardTs.photo)).toBeTruthy();
    if (_.isArray(vCardTs.photo)) {
      expect(vCardTs.photo.length).toEqual(3);

      {
        const photo = vCardTs.photo[0];
        expect(photo.encoding).toBeUndefined();
        expect(photo.value).toBeDefined();
        expect(photo.value as string).toEqual("https://d3m0kzytmr41b1.cloudfront.net/c335e945d1b60edd9d75eb4837c432f637e95c8a");
      }
      {
        const photo = vCardTs.photo[1];
        expect(photo.encoding).toBeUndefined();
        expect(photo.value).toBeDefined();
        expect(photo.value as string).toEqual("https://d3m0kzytmr41b1.cloudfront.net/c335e945d1b60edd9d75eb4837c432f637e95c8a");
      }{
        const photo = vCardTs.photo[2];
        expect(photo.encoding).toBeUndefined();
        expect(photo.value).toBeDefined();
        expect(photo.value as string).toEqual("https://d2ojpxxtu63wzl.cloudfront.net/static/aa915d1f29f19baf560e5491decdd30a_67c95da9133249fde8b0da7ceebc298bf680117e6f52054f7f5f7a95e8377238");
      }

    }
  });

  test('telephones', () => {
    expect(_.isArray(vCardTs.telephones)).toBeTruthy();
    if (_.isArray(vCardTs.telephones)) {
      expect(vCardTs.telephones.length).toEqual(9);

      {
        const tel = vCardTs.telephones[0];
        expect(tel.params['type']).toEqual(['home', 'voice']);
        expect(tel.tag).toEqual(TypeTag.HOME);
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1111');
      }
      {
        const tel = vCardTs.telephones[1];
        expect(tel.params['type']).toEqual(['work', 'voice']);
        expect(tel.tag).toEqual(TypeTag.WORK);
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1112');
      }
      {
        const tel = vCardTs.telephones[2];
        expect(tel.params['type']).toEqual(['cell', 'voice']);
        expect(tel.tag).toBeUndefined();
        expect(tel.device).toEqual(phoneDevice.CELL);
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1113');
      }
      {
        const tel = vCardTs.telephones[3];
        expect(tel.params['type']).toEqual(['cell', 'voice']);
        expect(tel.tag).toBeUndefined();
        expect(tel.device).toEqual(phoneDevice.CELL);
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1114');
      }
      {
        const tel = vCardTs.telephones[4];
        expect(tel.params['type']).toEqual('voice');
        expect(tel.tag).toBeUndefined();
        expect(tel.value).toEqual('555-555-1115');
      }
      {
        const tel = vCardTs.telephones[5];
        expect(tel.params['type']).toEqual(['home', 'fax']);
        expect(tel.tag).toEqual(TypeTag.HOME);
        expect(tel.device).toEqual(phoneDevice.FAX);
        expect(tel.value).toEqual('555-555-1116');
      }
      {
        const tel = vCardTs.telephones[6];
        expect(tel.params['type']).toEqual(['work', 'fax']);
        expect(tel.tag).toEqual(TypeTag.WORK);
        expect(tel.device).toEqual(phoneDevice.FAX);
        expect(tel.value).toEqual('555-555-1117');
      }
      {
        const tel = vCardTs.telephones[7];
        expect(tel.params['type']).toEqual('voice');
        expect(tel.tag).toBeUndefined();
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1118');
      }
      {
        const tel = vCardTs.telephones[8];
        expect(tel.params['type']).toEqual('voice');
        expect(tel.tag).toBeUndefined();
        expect(tel.capabilities).toEqual([phoneCapabilities.VOICE])
        expect(tel.value).toEqual('555-555-1119');
      }
    }
  });

  test('title', () => {
      expect(_.isArray(vCardTs.title)).toBeTruthy();
      if (_.isArray(vCardTs.title)) {
        expect(vCardTs.title.length).toEqual(2);

        {
          const title = vCardTs.title[0];
          expect(title.value).toEqual('Title1');
        }
        {
          const title = vCardTs.title[1];
          expect(title.value).toEqual('Title2');
        }
      }
  });

  test('url', () => {
        expect(_.isArray(vCardTs.url)).toBeTruthy();
        if (_.isArray(vCardTs.url)) {
          expect(vCardTs.url.length).toEqual(4);

          {
            const urlHome = vCardTs.url[0];
            expect(urlHome.tag).toBeUndefined();
            expect(urlHome.value).toEqual('http://www.homepage.com');
          }
          {
            const urlHome = vCardTs.url[1];
            expect(urlHome.tag).toBeUndefined();
            expect(urlHome.value).toEqual('http://www.blog.com');
          }
          {
            const urlHome = vCardTs.url[2];
            expect(urlHome.tag).toBeUndefined();
            expect(urlHome.value).toEqual('http://www.other.com');
          }
          {
            const urlHome = vCardTs.url[3];
            expect(urlHome.tag).toBeUndefined();
            expect(urlHome.value).toEqual('http://www.custom.com');
          }
        }
  });

  test('prodid', () => {
    expect(vCardTs.productID).toBeDefined();
    expect(vCardTs.productID).toEqual('ez-vcard 0.9.14-fc');
  });

  test('version', () => {
    expect(vCardTs.version).toEqual('4.0');
  });

  // --- Additional vCard 4.0 fields and custom fields ---

  // --- Custom/X- fields ---
  test('TODO: X-GENDER', () => {
    // TODO: Implement X-GENDER property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-ID', () => {
    // TODO: Implement X-ID property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-ETAG', () => {
    // TODO: Implement X-ETAG property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-FC-TAGS', () => {
    // TODO: Implement X-FC-TAGS property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-FC-LIST-ID', () => {
    // TODO: Implement X-FC-LIST-ID property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-FCENCODED-... related names', () => {
    // TODO: Implement related names property test when supported
    expect(true).toBe(true);
  });

  test('TODO: X-FCENCODED-... other dates', () => {
    // TODO: Implement other dates property test when supported
    expect(true).toBe(true);
  });
});