import { MailType, TypeTag, phoneDevice } from '../src/vCardTsTypes';
import { vCardTs3_0 } from '../src/vCardTs3_0';
import { vCardTs3_0Impl } from '../src/vCardTs3_0Impl';
import vCard from 'vcf';
import fs from 'fs';
import _ from 'lodash';

const vCardPath = 'tests/files/John_Doe_MAC_ADDRESS_BOOK.vcf';
let vCards: vCard[];

beforeAll(() => {
  const vCardData = fs.readFileSync(vCardPath, 'utf-8');
  vCards = vCard.parse(vCardData);
});

describe('Load vCards in vCardTs (John_Doe_MAC_ADDRESS_BOOK.vcf)', () => {
  test('vCardTs 3.0 construction for all', () => {
    vCards.forEach(vc => {
      const vCardTs = new vCardTs3_0Impl(vc);
      expect(vCardTs).toBeDefined();
    });
  });
});

describe('Test vCard3_0 properties (John_Doe_MAC_ADDRESS_BOOK.vcf)', () => {
  let vCardTs: vCardTs3_0;

  beforeAll(() => {
    vCardTs = new vCardTs3_0Impl(vCards[0]);
  });

  test('formatted name', () => {
    expect(typeof vCardTs.formattedName).toBe('string');
    expect(vCardTs.formattedName).toEqual('Mr. John Richter,James Doe Sr.');
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
      const addrHome = vCardTs.addresses[0];
      const expAddrHome = ["", "", "Silicon Alley 5,", "New York", "New York", "12345", "United States of America"];
      // TODO: Param check
      expect(addrHome.params['type']).toEqual(['home', 'pref']);
      expect(addrHome.tag).toEqual(TypeTag.HOME);
      expect(addrHome.preferenceIdx).toEqual(1);
      expect(addrHome.value).toEqual(expAddrHome);
      const addrWork = vCardTs.addresses[1];
      const expAddrWork = ["", "", "Street4\nBuilding 6\nFloor 8", "New York", "", "12345", "USA"];
      // TODO: Param check
      expect(addrWork.params['type']).toEqual('work');
      expect(addrWork.tag).toEqual(TypeTag.WORK);
      expect(addrWork.preferenceIdx).toEqual(undefined);
      expect(addrWork.value).toEqual(expAddrWork);
    }
  });

  test('telephones', () => {
    expect(_.isArray(vCardTs.telephones)).toBeTruthy();
    if (_.isArray(vCardTs.telephones)) {
      expect(vCardTs.telephones.length).toEqual(7);

       // Test 1: Work phone
      {
        const telWork = vCardTs.telephones[0];
        const telWorkParams = telWork.params;
        expect(telWorkParams['type']).toEqual(["work", "pref"]);
        expect(telWork.type).toEqual(['work', 'pref']);
        expect(telWork.tag).toEqual(TypeTag.WORK);
        expect(telWork.preferenceIdx).toEqual(1);
        expect(telWork.value).toEqual('905-777-1234');
      }

      // Test 2: Home phone
      {
        const telHome = vCardTs.telephones[1];
        const telHomeParams = telHome.params;
        expect(telHomeParams['type']).toEqual('home');
        expect(telHome.type).toEqual(['home']);
        expect(telHome.tag).toEqual(TypeTag.HOME);
        expect(telHome.preferenceIdx).toBeUndefined();
        expect(telHome.value).toEqual('905-666-1234');
      }

      // Test 3: Cell phone
      {
        const telCell = vCardTs.telephones[2];
        const telCellParams = telCell.params;
        expect(telCellParams['type']).toEqual('cell');
        expect(telCell.type).toEqual(['cell']);
        expect(telCell.device).toEqual(phoneDevice.CELL);
        expect(telCell.preferenceIdx).toBeUndefined();
        expect(telCell.value).toEqual('905-555-1234');
      }

      // Test 4: Fax (home)
      {
        const telFaxHome = vCardTs.telephones[3];
        const telFaxHomeParams = telFaxHome.params;
        expect(telFaxHomeParams['type']).toEqual(['home', 'fax']);
        expect(telFaxHome.type).toEqual(['home', 'fax']);
        expect(telFaxHome.tag).toEqual(TypeTag.HOME);
        expect(telFaxHome.preferenceIdx).toBeUndefined();
        expect(telFaxHome.value).toEqual('905-888-1234');
      }

      // Test 4: Fax (work)
      {
        const telFaxWork = vCardTs.telephones[4];
        const telFaxWorkParams = telFaxWork.params;
        expect(telFaxWorkParams['type']).toEqual(['work', 'fax']);
        expect(telFaxWork.type).toEqual(['work', 'fax']);
        expect(telFaxWork.tag).toEqual(TypeTag.WORK);
        expect(telFaxWork.preferenceIdx).toBeUndefined();
        expect(telFaxWork.value).toEqual('905-999-1234');
      }

      // Test 6: Pager
      {
        const telPager = vCardTs.telephones[5];
        const telPagerParams = telPager.params;
        expect(telPagerParams['type']).toEqual('pager');
        expect(telPager.type).toEqual(['pager']);
        expect(telPager.preferenceIdx).toBeUndefined();
        expect(telPager.value).toEqual('905-111-1234');
      }

      // Test 7: Assistant
      {
        // TODO: Adjust test when MAC exported vCard with X-ABLabel support is implemented
        const telAssistant = vCardTs.telephones[6];
        const telAssistantParams = telAssistant.params;
        expect(telAssistantParams['group']).toEqual('item1');
        expect(telAssistant.preferenceIdx).toBeUndefined();
        expect(telAssistant.value).toEqual('905-222-1234');
      }
    }
  });

  test('emails', () => {
      expect(_.isArray(vCardTs.emails)).toBeTruthy();
      if (_.isArray(vCardTs.emails)) {
        expect(vCardTs.emails.length).toEqual(1);
        const emailWork = vCardTs.emails[0];
        expect(emailWork.params['type']).toEqual(['internet', 'work', 'pref']);
        expect(emailWork.preferenceIdx).toEqual(1);
        expect(emailWork.addressType).toEqual(MailType.internet);
        expect(emailWork.tag).toEqual(TypeTag.WORK);
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
      expect(urlWorkParams['type']).toEqual('pref');
      expect(urlWork.preferenceIdx).toEqual(1);
      expect(urlWork.url).toEqual(new URL('http://www.ibm.com'))
      // FIXME: Overload vCardProberty with value as URL
      expect(urlWork.value).toEqual("http://www.ibm.com")
    }
  });

  test('note', () => {
    expect(vCardTs.note).toEqual("THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND" +
      " CONTRIBUTORS \\\"AS IS\\\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED" +
      " TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE" +
      " DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY" +
      " DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING," +
      " BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR" +
      " PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER" +
      " IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY" +
      " WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n" +
      "Favotire Color: Blue")
  });

  test('birthday', () => {
    const expected_bday = new Date(2012, 5, 6);
    expect(vCardTs.birthdate).toEqual(expected_bday);
  });

  test('photo', () => {
    expect(_.isArray(vCardTs.photo)).toBeTruthy();
    if (_.isArray(vCardTs.photo)) {
      const photo = vCardTs.photo[0];
      expect(photo.encoding).toEqual("base64");
      expect(photo.value).toBeDefined();
      expect((photo.value as string).startsWith("/9j/4AAQSkZJRgABAQAAAQABAAD/")).toBeTruthy();
    }
  });

  test('categories', () => {
    // Categories are not present in test case.
    expect(
    vCardTs.categories === undefined
    ).toBeTruthy();
  });

  test('phonetic names', () => {
    // X-PHONETIC-FIRST-NAME, X-PHONETIC-LAST-NAME
    // TODO: Implement phonetic name property test when supported
    expect(true).toBe(true);
  });

  test('custom labels', () => {
    // item1.X-ABLabel, item2.X-ABADR, etc.
    // TODO: Implement custom label property test when supported
    expect(true).toBe(true);
  });

  test('version', () => {
    expect(vCardTs.version).toEqual('3.0');
  });
});