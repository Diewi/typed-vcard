import { MailType, TypeTag } from '../src/vCardTsTypes';
import { vCardTsOutlook } from '../src/vCardTsOutlook';
import { vCardTsOutlookImpl } from '../src/vCardTsOutlookImpl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';

const vCardPath = 'tests/files/John_Doe_MS_OUTLOOK.vcf';
let vCards: vCard[];

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCards = vCard.parse(vCardData);
});

describe('Load vCards in vCardTs (John_Doe_MS_OUTLOOK.vcf)', () => {
  test('vCardTs 2.1 construction for all', () => {
    vCards.forEach(vc => {
      const vCardTs = new vCardTsOutlookImpl(vc);
      expect(vCardTs).toBeDefined();
    });
  });
});

describe('Test vCard2_1 properties (John_Doe_MS_OUTLOOK.vcf)', () => {
  let vCardTs: vCardTsOutlook;

  beforeAll(() => {
    vCardTs = new vCardTsOutlookImpl(vCards[0]);
  });

  test('formatted name', () => {
    expect(typeof vCardTs.formattedName).toBe('string');
    // TODO: Add comma again ater upstream vcf library is fixed to consume unescaped commas in
    // vCard 2.1
    // expect(vCardTs.formattedName).toEqual('Mr. John Richter,James Doe Sr.');
    expect(vCardTs.formattedName).toEqual('Mr. John Richter James Doe Sr.');
  });

  test('name', () => {
    expect(vCardTs.name).toBeDefined();
    if (vCardTs.name) {
      expect(vCardTs.name.familyName).toEqual('Doe');
      expect(vCardTs.name.givenName).toEqual('John');
      expect(vCardTs.name.honorificPrefix).toEqual('Mr.');
      expect(vCardTs.name.honorificSuffix).toEqual('Sr.');
      expect(vCardTs.name.additionalName).toEqual('Richter,James');
    }
  });

  test('nickname', () => {
    expect(vCardTs.nickname).toBeDefined();
    expect(vCardTs.nickname).toEqual('Johny');
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

  test('note', () => {
    expect(vCardTs.note).toEqual("THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND" +
      " CONTRIBUTORS ''AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED" +
      " TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE" +
      " DISCLAIMED. IN NO EVENT SHALL GEORGE EL-HADDAD OR CONTRIBUTORS BE LIABLE FOR ANY" +
      " DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING," +
      " BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR" +
      " PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER" +
      " IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY" +
      " WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.")
  });

  test('birthday', () => {
    const expected_bday = new Date(1980, 2, 22);
    expect(vCardTs.birthdate).toEqual(expected_bday);
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

  // TODO: Add additional tests for the extra fields in MS OUTLOOK vCard

  test('categories', () => {
    expect(
      vCardTs.categories === undefined ||
      Array.isArray(vCardTs.categories)
    ).toBeTruthy();
    // TODO: Check categories value if present
  });

  test('role', () => {
    expect(vCardTs.role).toEqual('Counting Money');
  });

  test('version', () => {
    expect(vCardTs.version).toEqual('2.1');
  });
});