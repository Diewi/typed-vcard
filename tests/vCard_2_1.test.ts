import { MailType, TypeTag } from '../src/vCardTsTypes';
import { vCardTs2_1 } from '../src/vCardTs2_1';
import { vCardTs2_1Impl } from '../src/vCardTs2_1Impl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';

// FIXME: Add test with multiple vCards for common to ensure coverage of all common methods

const vCardPath = 'tests/files/John_Doe_vCard_2_1.vcf';
let vCard2_1: vCard;

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCard2_1 = vCard.parse(vCardData)[0];
});

describe('Load vCard in vCardTs', () => {
  test('vCardTs 2.1 construction', () => {
    const vCardTs2_1 = new vCardTs2_1Impl(vCard2_1);
    expect(vCardTs2_1).toBeDefined();
  });
});

describe('Test vCard2_1 properties (John_Doe_vCard_2_1.vcf)', () => {
  let vCardTs: vCardTs2_1;

  beforeAll(() => {
    vCardTs = new vCardTs2_1Impl(vCard2_1);
  });

  /*********************************************************
   * Common Part. VCard version specific fields below.
   ********************************************************/

  test('addresses', () => {
    expect(_.isArray(vCardTs.addresses)).toBeTruthy();
    if (_.isArray(vCardTs.addresses)) {
      expect(vCardTs.addresses.length).toEqual(2);
      const addrWork = vCardTs.addresses[0];
      const expAddrWork = ["", "", "Cresent moon drive", "Albaney", "New York", "12345", "United States of America"];
      // TODO: Param check
      expect(addrWork.params['type']).toEqual(['work', 'pref']);
      expect(addrWork.tag).toEqual(TypeTag.WORK);
      expect(addrWork.preferenceIdx).toEqual(1);
      expect(addrWork.value).toEqual(expAddrWork);
      const addrHome = vCardTs.addresses[1];
      const expAddrHome = ["", "", "Silicon Alley 5,", "New York", "New York", "12345", "United States of America"];
      // TODO: Param check
      expect(addrHome.tag).toEqual(TypeTag.HOME);
      expect(addrHome.preferenceIdx).toEqual(undefined);
      expect(addrHome.value).toEqual(expAddrHome);
    }
  });

  test('birthday', () => {
    const expected_bday = new Date(1980, 2, 22);
    expect(vCardTs.birthdate).toEqual(expected_bday);
  });

  // TODO: Add category to test vcard.
  test('categories', () => {
    expect(vCardTs.categories).toBeUndefined;
  });

  test('emails', () => {
    expect(_.isArray(vCardTs.emails)).toBeTruthy();
    if (_.isArray(vCardTs.emails)) {
      expect(vCardTs.emails.length).toEqual(1);
      const emailWork = vCardTs.emails[0];
      expect(emailWork.params['type']).toEqual(['pref', 'internet']);
      expect(emailWork.preferenceIdx).toEqual(1);
      expect(emailWork.addressType).toEqual(MailType.internet);
      expect(emailWork.value).toEqual('john.doe@ibm.com');
    }
  });

  test('formatted name', () => {
    expect(vCardTs.formattedName).toEqual('Mr. John Richter James Doe Sr.');
  });

  // TODO: Add key to test vcard.
  test('key', () => {
    expect(vCardTs.key).toBeUndefined;
  });

  // TODO: Add logo to test vcard.
  test('logo', () => {
    expect(vCardTs.logo).toBeUndefined;
  });

  test('name', () => {
    expect(vCardTs.name).toBeDefined();
    if (vCardTs.name) {
      const n = vCardTs.name;
      expect(n.params['language']).toEqual('en-us');
      const expName = ["Doe", "John", "Richter,James", "Mr.", "Sr."];
      expect(n.value).toEqual(expName);
      expect(n.locale).toEqual('en-us');
      expect(n.familyName).toEqual('Doe');
      expect(n.givenName).toEqual('John');
      expect(n.additionalName).toEqual('Richter,James');
      expect(n.honorificPrefix).toEqual('Mr.');
      expect(n.honorificSuffix).toEqual('Sr.');
    }
  });

  // TODO: Add note to test vcard.
  test('note', () => {
    expect(vCardTs.note).toBeUndefined;
  });

  test('organization', () => {
    expect(vCardTs.organization).toBeDefined();
    if (vCardTs.organization) {
      const org = vCardTs.organization[0];
      expect(org.params).toBeDefined();
      expect(org.value).toEqual("IBM;Accounting");
      expect(org.organizationName).toEqual("IBM");
      expect(org.organizationUnit).toEqual(["Accounting"]);
    }
  });

  test('photo', () => {
    expect(_.isArray(vCardTs.photo)).toBeTruthy();
    if (_.isArray(vCardTs.photo)) {
      expect(vCardTs.photo.length).toEqual(1);

      {
        const photo = vCardTs.photo[0];
        const photoParams = photo.params;
        expect(photoParams["type"]).toEqual("jpeg");
        expect(photo.type).toEqual(["jpeg"]);
        expect(photo.mediaType).toEqual({ type: "image", subType: "jpeg" });
        expect(photoParams['encoding']).toEqual("BASE64");
        expect(photo.value).toEqual('\
/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQY\
GBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYa\
KCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAAR\
CAAaACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAA\
AgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkK\
FhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWG\
h4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl\
5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREA\
AgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYk\
NOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOE\
hYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk\
5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDzS20gtj5a1R4feMqJYnQlQwDAjII4Irub\
PQTx8ldNYacfs6213F59sM7R0eL1Kn+nT+dZyk1sQ2zyUaBkfc/SpB4ZOPuc/Su61vSo5tTf\
SrZySEDKWQgyFgSowSBgEDdz7Z71S8ITNB4luPD2szQvdvM4t/KYsoGNwUNgZwAecCpVWLfK\
NO56ba2sSqpIGD0Na1vDBxwKwYifU1dhJx1NJq5m1cw/Enw9Gt6ydRbXLmNljMcUW0FYgSCc\
YI9KXwX4EXwz4hm1STUhdM8RiCtGM4JByWz7DpXQ72/vH86idm/vH86ShZ3uNXtY/9k=');
      }
    }
  });

  test('revision', () => {
    const expected_rev = new Date(2012, 2, 5, 14, 19, 33);
    expect(vCardTs.revision).toEqual(expected_rev);
  });

  test('role', () => {
    expect(vCardTs.role).toEqual('Counting Money');
  });

  // TODO: Add sound to test vcard.
  test('sound', () => {
    expect(vCardTs.sound).toBeUndefined;
  });

  // TODO: Add source to test vcard.
  test('source', () => {
    expect(vCardTs.source).toBeUndefined;
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
      expect(telWork.preferenceIdx).toEqual(undefined);
      expect(telWork.value).toEqual('(905) 555-1234')

      const telHome = vCardTs.telephones[1];
      const telHomeParams = telHome.params;
      // FIXME: ADR, MAIL, AND TEL types need explicitly assigned keys in vcard 2.1
      expect(telHomeParams['type']).toEqual(["home", "voice"]);
      expect(telHome.type).toEqual(['home', 'voice']);
      expect(telHome.tag).toEqual(TypeTag.HOME);
      expect(telHome.capabilities).toEqual(['voice']);
      expect(telHome.preferenceIdx).toEqual(undefined);
      expect(telHome.value).toEqual('(905) 666-1234')
    }
  });

  test('title', () => {
      expect(_.isArray(vCardTs.title)).toBeTruthy();
      if (_.isArray(vCardTs.title)) {
        expect(vCardTs.title.length).toEqual(1);

        {
          const title = vCardTs.title[0];
          expect(title.value).toEqual('Money Counter');
        }
      }
  });

  // TODO: Add source to test vcard.
  test('timezone', () => {
    expect(vCardTs.source).toBeUndefined;
  });

  // TODO: Add source to test vcard.
  test('uid', () => {
    expect(vCardTs.uid).toBeUndefined;
  });

  test('url', () => {
    expect(_.isArray(vCardTs.url)).toBeTruthy();
    if (_.isArray(vCardTs.url)) {
      expect(vCardTs.url.length).toEqual(1);
      const urlWork = vCardTs.url[0];
      const urlWorkParams = urlWork.params;
      // FIXME: ADR, MAIL, AND TEL types need explicitly assigned keys in vcard 2.1
      expect(urlWorkParams['type']).toEqual('work');
      expect(urlWork.type).toEqual(["work"]);
      expect(urlWork.tag).toEqual(TypeTag.WORK);
      expect(urlWork.preferenceIdx).toEqual(undefined);
      expect(urlWork.url).toEqual(new URL('http://www.ibm.com'))
      // FIXME: Overload vCardProberty with value as URL
      expect(urlWork.value).toEqual("http://www.ibm.com")
    }
  });

  test('version', () => {
    expect(vCardTs.version).toEqual('2.1');
  });

  /*********************************************************
   * END Common Part
   ********************************************************/

  /*********************************************************
   * VCard 2.1 specific fields below.
   ********************************************************/

});