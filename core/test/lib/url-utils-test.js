/**
 * @license Copyright 2016 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import assert from 'assert/strict';

import UrlUtils from '../../lib/url-utils.js';

const superLongName =
    'https://example.com/thisIsASuperLongURLThatWillTriggerFilenameTruncationWhichWeWantToTest.js';

describe('UrlUtils', () => {
  it('handles URLs beginning with multiple digits', () => {
    // from https://github.com/GoogleChrome/lighthouse/issues/1186
    const url = 'http://5321212.fls.doubleclick.net/activityi;src=5321212;type=unvsn_un;cat=unvsn_uv;ord=7762287885264.98?';
    assert.doesNotThrow(_ => new URL(url));
  });

  it.skip('handles URLs with multiple dashes', () => {
    // from https://github.com/GoogleChrome/lighthouse/issues/1972
    const url = 'https://r15---sn-o097znl7.googlevideo.com/generate_204?conn2';
    assert.doesNotThrow(_ => new URL(url));
  });

  it('safely identifies valid URLs', () => {
    assert.ok(UrlUtils.isValid('https://5321212.fls.net/page?query=string#hash'));
    assert.ok(UrlUtils.isValid('https://localhost:8080/page?query=string#hash'));
    assert.ok(UrlUtils.isValid('https://google.co.uk/deep/page?query=string#hash'));
  });

  it('safely identifies invalid URLs', () => {
    assert.equal(UrlUtils.isValid(''), false);
    assert.equal(UrlUtils.isValid('eval(<context>):45:16'), false);
  });

  it('safely identifies allowed URL protocols', () => {
    assert.ok(UrlUtils.isProtocolAllowed('http://google.com/'));
    assert.ok(UrlUtils.isProtocolAllowed('https://google.com/'));
    assert.ok(UrlUtils.isProtocolAllowed('chrome://version'));
    assert.ok(UrlUtils.isProtocolAllowed('chrome-extension://blipmdconlkpinefehnmjammfjpmpbjk/popup.html'));
  });

  it('safely identifies disallowed URL protocols', () => {
    assert.equal(UrlUtils.isProtocolAllowed('file:///i/am/a/fake/file.html'), false);
    assert.equal(UrlUtils.isProtocolAllowed('ftp://user:password@private.ftp.example.com/index.html'), false);
    assert.equal(UrlUtils.isProtocolAllowed('gopher://underground:9090/path'), false);
  });

  it('safely identifies same hosts', () => {
    const urlA = 'https://5321212.fls.net/page?query=string#hash';
    const urlB = 'http://5321212.fls.net/deeply/nested/page';
    assert.ok(UrlUtils.hostsMatch(urlA, urlB));
  });

  it('safely identifies different hosts', () => {
    const urlA = 'https://google.com/page?query=string#hash';
    const urlB = 'http://google.co.uk/deeply/nested/page';
    assert.equal(UrlUtils.hostsMatch(urlA, urlB), false);
  });

  it('safely identifies invalid hosts', () => {
    const urlA = 'https://google.com/page?query=string#hash';
    const urlB = 'anonymous:45';
    assert.equal(UrlUtils.hostsMatch(urlA, urlB), false);
  });

  it('safely identifies same origins', () => {
    const urlA = 'https://5321212.fls.net/page?query=string#hash';
    const urlB = 'https://5321212.fls.net/deeply/nested/page';
    assert.ok(UrlUtils.originsMatch(urlA, urlB));
  });

  it('safely identifies different origins', () => {
    const urlA = 'https://5321212.fls.net/page?query=string#hash';
    const urlB = 'http://5321212.fls.net/deeply/nested/page';
    assert.equal(UrlUtils.originsMatch(urlA, urlB), false);
  });

  it('safely identifies different invalid origins', () => {
    const urlA = 'https://google.com/page?query=string#hash';
    const urlB = 'anonymous:90';
    assert.equal(UrlUtils.originsMatch(urlA, urlB), false);
  });

  it('safely gets valid origins', () => {
    const urlA = 'https://google.com/page?query=string#hash';
    const urlB = 'https://5321212.fls.net/page?query=string#hash';
    const urlC = 'http://example.com/deeply/nested/page';
    assert.equal(UrlUtils.getOrigin(urlA), 'https://google.com');
    assert.equal(UrlUtils.getOrigin(urlB), 'https://5321212.fls.net');
    assert.equal(UrlUtils.getOrigin(urlC), 'http://example.com');
  });

  it('safely gets URLs with no origin', () => {
    const urlA = 'data:image/jpeg;base64,foobar';
    const urlB = 'anonymous:90';
    const urlC = '!!garbage';
    const urlD = 'file:///opt/lighthouse/index.js';
    assert.equal(UrlUtils.getOrigin(urlA), null);
    assert.equal(UrlUtils.getOrigin(urlB), null);
    assert.equal(UrlUtils.getOrigin(urlC), null);
    assert.equal(UrlUtils.getOrigin(urlD), null);
  });

  describe('rootDomainsMatch', () => {
    it('matches a subdomain and a root domain', () => {
      const urlA = 'http://example.com/js/test.js';
      const urlB = 'http://example.com/';
      const urlC = 'http://sub.example.com/js/test.js';
      const urlD = 'http://sub.otherdomain.com/js/test.js';

      assert.ok(UrlUtils.rootDomainsMatch(urlA, urlB));
      assert.ok(UrlUtils.rootDomainsMatch(urlA, urlC));
      assert.ok(!UrlUtils.rootDomainsMatch(urlA, urlD));
      assert.ok(!UrlUtils.rootDomainsMatch(urlB, urlD));
    });

    it(`doesn't break on urls without a valid host`, () => {
      const urlA = 'http://example.com/js/test.js';
      const urlB = 'data:image/jpeg;base64,foobar';
      const urlC = 'anonymous:90';
      const urlD = '!!garbage';
      const urlE = 'file:///opt/lighthouse/index.js';

      assert.ok(!UrlUtils.rootDomainsMatch(urlA, urlB));
      assert.ok(!UrlUtils.rootDomainsMatch(urlA, urlC));
      assert.ok(!UrlUtils.rootDomainsMatch(urlA, urlD));
      assert.ok(!UrlUtils.rootDomainsMatch(urlA, urlE));
      assert.ok(!UrlUtils.rootDomainsMatch(urlB, urlC));
      assert.ok(!UrlUtils.rootDomainsMatch(urlB, urlD));
      assert.ok(!UrlUtils.rootDomainsMatch(urlB, urlE));
    });

    it(`matches tld plus domains`, () => {
      const coUkA = 'http://example.co.uk/js/test.js';
      const coUkB = 'http://sub.example.co.uk/js/test.js';
      const testUkA = 'http://example.test.uk/js/test.js';
      const testUkB = 'http://sub.example.test.uk/js/test.js';
      const ltdBrA = 'http://example.ltd.br/js/test.js';
      const ltdBrB = 'http://sub.example.ltd.br/js/test.js';
      const privAtA = 'http://examplepriv.at/js/test.js';
      const privAtB = 'http://sub.examplepriv.at/js/test.js';

      assert.ok(UrlUtils.rootDomainsMatch(coUkA, coUkB));
      assert.ok(UrlUtils.rootDomainsMatch(testUkA, testUkB));
      assert.ok(UrlUtils.rootDomainsMatch(ltdBrA, ltdBrB));
      assert.ok(UrlUtils.rootDomainsMatch(privAtA, privAtB));
    });
  });

  describe('getURLDisplayName', () => {
    it('respects numPathParts option', () => {
      const url = 'http://example.com/a/deep/nested/file.css';
      const result = UrlUtils.getURLDisplayName(url, {numPathParts: 3});
      assert.equal(result, '\u2026deep/nested/file.css');
    });

    it('respects preserveQuery option', () => {
      const url = 'http://example.com/file.css?aQueryString=true';
      const result = UrlUtils.getURLDisplayName(url, {preserveQuery: false});
      assert.equal(result, '/file.css');
    });

    it('respects preserveHost option', () => {
      const url = 'http://example.com/file.css';
      const result = UrlUtils.getURLDisplayName(url, {preserveHost: true});
      assert.equal(result, 'example.com/file.css');
    });

    it('Elides hashes', () => {
      const url = 'http://example.com/file-f303dec6eec305a4fab8025577db3c2feb418148ac75ba378281399fb1ba670b.css';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '/file-f303dec\u2026.css');
    });

    it('Elides hashes in the middle', () => {
      const url = 'http://example.com/file-f303dec6eec305a4fab80378281399fb1ba670b-somethingmore.css';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '/file-f303dec\u2026-somethingmore.css');
    });

    it('Elides google-fonts hashes', () => {
      const url = 'https://fonts.gstatic.com/s/droidsans/v8/s-BiyweUPV0v-yRb-cjciAzyDMXhdD8sAj6OAJTFsBI.woff2';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '\u2026v8/s-BiyweUP\u2026.woff2');
    });

    it('Elides long number sequences', () => {
      const url = 'http://cdn.cnn.com/cnnnext/dam/assets/150507173438-11-week-in-photos-0508-large-169.jpg';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '\u2026assets/150\u2026-11-week-in-photos-0508-large-169.jpg');
    });


    it('Elides query strings when can first parameter', () => {
      const url = 'http://example.com/file.css?aQueryString=true&other_long_query_stuff=false&some_other_super_long_query';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '/file.css?aQueryString=\u2026');
    });

    it('Elides query strings when cannot preserve first parameter', () => {
      const url = 'http://example.com/file.css?superDuperNoGoodVeryLongExtraSpecialOnlyTheBestEnourmousQueryString=true';
      const result = UrlUtils.getURLDisplayName(url);
      assert.equal(result, '/file.css?\u2026');
    });

    it('Elides long names', () => {
      const result = UrlUtils.getURLDisplayName(superLongName);
      const expected = '/thisIsASuperLongURLThatWillTriggerFilenameTruncationWhichWe\u2026.js';
      assert.equal(result, expected);
    });

    it('Elides long names with hash', () => {
      const url = superLongName.slice(0, -3) +
          '-f303dec6eec305a4fab8025577db3c2feb418148ac75ba378281399fb1ba670b.css';
      const result = UrlUtils.getURLDisplayName(url);
      const expected = '/thisIsASu\u2026.css';
      assert.equal(result, expected);
    });

    it('Elides path parts properly', () => {
      assert.equal(UrlUtils.getURLDisplayName('http://example.com/file.css'), '/file.css');
      assert.equal(UrlUtils.getURLDisplayName('http://t.co//file.css'), '//file.css');
      assert.equal(UrlUtils.getURLDisplayName('http://t.co/a/file.css'), '/a/file.css');
      assert.equal(UrlUtils.getURLDisplayName('http://t.co/a/b/file.css'), '\u2026b/file.css');
    });

    it('Elides path parts properly when used with preserveHost', () => {
      const getResult = path => UrlUtils.getURLDisplayName(`http://g.co${path}`, {preserveHost: true});
      assert.equal(getResult('/file.css'), 'g.co/file.css');
      assert.equal(getResult('/img/logo.jpg'), 'g.co/img/logo.jpg');
      assert.equal(getResult('//logo.jpg'), 'g.co//logo.jpg');
      assert.equal(getResult('/a/b/logo.jpg'), 'g.co/\u2026b/logo.jpg');
    });

    it.only('elides pleasingly', () => {
      const urls = [
        'https://ats.rlcdn.com/ats.js',
        'https://cdn.concert.io/lib/concert-ads/v2-latest/concert_ads.js',
        'https://securepubads.g.doubleclick.net/gpt/pubads_impl_2023010501.js?cb=31071517',
        'https://z.moatads.com/stackadaptdisplay515602019759/moatad.js',
        'https://www.theverge.com/_next/static/chunks/47-c1d7449f7414bf61.js',
        'https://www.googletagservices.com/activeview/js/current/rx_lidar.js?cache=r20110914',
        'https://cdn.doubleverify.com/dv-measurements3398.js',
        'https://micro.rubiconproject.com/prebid/dynamic/7470.js',
        'https://z.moatads.com/voxprebidheader841653991752/moatheader.js',
        'https://www.googletagmanager.com/gtag/js?id=G-9GXHZT6RVE&l=dataLayer&cx=c',
        'https://hymnal-prod.vox-cdn.com/ads/house_promotions_covid_19_content_link_promo_b302176a-5550-482a-8d62-e9be0489394e/ad.js',
        'https://www.googleoptimize.com/optimize.js?id=GTM-54FC4VZ',
        'https://www.theverge.com/_next/static/chunks/pages/_app-692fa9c9a56fbbe9.js',
        'https://www.googletagmanager.com/gtm.js?id=GTM-WQ5FM5W',
        'https://static.narrativ.com/tags/narrativ-pub.1.0.0.js',
        'https://c.amazon-adsystem.com/aax2/apstag.js',
        'https://cdn.permutive.com/d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-web.js',
        'https://www.theverge.com/_next/static/chunks/311-8bad5d5b0875fc8a.js',
        'https://analytics.rlcdn.com/',
        'https://hymnal-prod.vox-cdn.com/libraries/underscore-1.5.1.min.js',
        'https://s3.amazonaws.com/stackadapt_public/js/saimp.js',
        'https://mb.moatads.com/yi/v2?ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&url=https%3A%2F%2Fwww.theverge.com%2F&pcode=voxprebidheader841653991752&rx=948497022904&callback=MoatNadoAllJsonpRequest_87887703',
        'https://hymnal-prod.vox-cdn.com/thumbor/61Zkv7zmS91LwBeYGCFuI-W33iE=/fit-in/600x600/hymnal-prod.vox-cdn.com/uploads/asset/file/100962/justvox.jpg',
        'https://www.googletagservices.com/tag/js/gpt.js',
        'https://pagead2.googlesyndication.com/bg/sU6CjPDj0xr2jbZF4y7IwEoRNSn0ddnQS8nRuvxnxiY.js',
        'https://pub.doubleverify.com/signals/pub.js',
        'https://cdn.permutive.com/models/v2/d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-models.bin',
        'https://z.moatads.com/voxcustomdfp152282307853/moatad.js',
        'https://cdn.concert.io/lib/bids/browserify-consent-string.js',
        'https://cdn.concert.io/lib/concert-concierge.2.10.1.min.js',
        'https://eus.rubiconproject.com/usync.js',
        'https://ads.rubiconproject.com/prebid/creative.js',
        'https://cdn.parsely.com/keys/theverge.com/p.js',
        'https://duet-cdn.vox-cdn.com/thumbor/0x0:2040x1360/750x600/filters:focal(1020x680:1021x681):format(webp)/cdn.vox-cdn.com/uploads/chorus_asset/file/24037424/226274_APPLE_WATCH_ULTRA_PHO_akrales_0581.jpg',
        'https://hymnal-prod.vox-cdn.com/libraries/jquery-1.10.2.min.gz.js',
        'https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/844c0e39171612fac32bcdd5ada42603.jpg',
        'https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/a8cb7df9b005b56d9c09701777d4a257.jpg',
        'https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/046a4be2555b0fbdeab0493c7bd3ccb9.js',
        'https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/094960b3cbb51fe1f9345472b3304207.jpg',
        'https://ak.sail-horizon.com/spm/spm.v1.min.js',
        'https://js-sec.indexww.com/ht/p/183789-71940066017360.js',
        'https://acdn.adnxs.com/dmp/async_usersync.html',
        'https://www.google-analytics.com/analytics.js',
        'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2',
        'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2',
        'https://static.ads-twitter.com/uwt.js',
        'https://ads.pubmatic.com/AdServer/js/user_sync.html?p=156011&s=165626&predirect=https%3A%2F%2Fs.amazon-adsystem.com%2Fecm3%3Fex%3Dpubmatic.com%26id%3DPM_UID',
        'https://ads.pubmatic.com/AdServer/js/user_sync.html?kdntuid=1&p=159303&us_privacy=1YNY',
        'https://static.scroll.com/js/scroll.js',
        'https://cdn.doubleverify.com/dvtp_src.js?t2te=0&seltag=1&adsrv=104&cmp=DV510213&ctx=21236410&sadv=48933784&ord=2702456324&litm=5389138550&scrt=138313703890&splc=/172968584/verge/front_page&adu=172393864&unit=1x1&dvp_qtpid=78ac1313-9b7f-43a3-a207-466adfafe89c&dvp_qtsid=4532a35a-8daa-4b9b-95a5-9d10e016ab80&btreg=5389138550138313703890&btadsrv=5389138550138313703890&spos=&c1=front-page&c2=&c3=&c4=home_page&c5=14285,14373,23231,23238,27179,29301,33252,34913,34914,34916,34917,37532,38622,46766,52409,55836,56587,73555,88725,112273,112274,112275,112276,112277,112278,112280,112281,112282,112376,112632,112800,rts&c6=list_51,list_89,list_98,list_129,list_200,list_206,list_324,list_325,list_394,list_466,list_528,list_536,list_537,list_591,list_603,list_674,list_676,list_685,list_772,list_773,list_777,list_781,list_807,list_875,list_879,list_895,list_902,list_909,list_959,list_999,list_1023,list_1065,list_1117,list_1125,list_1246,list_1286,list_1329,list_1330,list_1334,list_1345,list_1382,list_1383,list_1387,list_1396,list_1450&c7=26,26.4,26.4.3,26.3,26.4.1',
        'https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/cbaae8cca2cada92d99c50fec9b72810.png',
        'https://creative.stackadapt.com/icons/adchoices/adchoices.png',
        'https://s3.amazonaws.com/stackadapt_public/js/saurl.js',
        'https://uw.srv.stackadapt.com/cookie?campid=258451&nativeid=2249172&domain=theverge.com%3A%3A94&auctionid=1-9205-167348835284906087300089-2&impindex=0&m=NzMuMjQxLjEwMS43MQ&isipgen=0&conv=1',
        'https://creative.stackadapt.com/js/cat.js',
        'https://pr-bh.ybp.yahoo.com/sync/casale/Y79n4agaKXcgT7zIMaazRQAACkYAAAAB?gdpr_consent=&us_privacy=&gdpr=',
        'https://px.ads.linkedin.com/setuid?partner=rubiconDb&dbredirect=true&ruxId=LCSFR9X8-15-GFYC',
        'https://www.facebook.com/tr/?id=594981607301768&ev=PixelInitialized&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=&if=false&ts=1673488352379',
        'https://uw.srv.stackadapt.com/cv?aid=1-9205-167348835284906087300089-2&iidx=0&cv=%20%22%22&iv=ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00f7fa28a2803fffd994c3a5a6175945015a237e68ba60993549f16547',
        'https://uw.srv.stackadapt.com/track_user_page?aid=1-9205-167348835284906087300089-2&iid=1&br_domain=theverge.com&br_ip=73.241.101.71&window_location_href=https%3A%2F%2Fwww.theverge.com%2F&top_location_href=https%3A%2F%2Fwww.theverge.com%2F&is_iframe=true&network=index&br_page_url=https://www.theverge.com/',
        'https://www.facebook.com/tr/?id=594981607301768&ev=PixelInitialized&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=https%3A%2F%2Fwww.theverge.com%2F&if=false&ts=1673488352735',
        'https://www.facebook.com/tr/?id=null&ev=6026192431231&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=&if=false&ts=1673488352379&cd[value]=1.00&cd[currency]=USD',
        'https://s.amazon-adsystem.com/x/757c0557066e95cfd4c7?gdpr=0&gdpr_consent=&uid=3212683525146180232798',
        'https://uw.evm1.stackadapt.com/win?aid=1-9205-167348835284906087300089-2&sid=1&wp=0.79&rid=1f052c40-c34a-4bee-b1a3-2427e8f7943a&network=94&t=1673488352&said=1-9205-167348835284906087300089-2&sanid=94',
        'https://d.adroll.com/cm/index/tp_out?advertisable=3GMDZMBFQREVBC75SYYKWH',
        'https://mb.moatads.com/s/v2?url=https%3A%2F%2Fwww.theverge.com%2F&pcode=stackadaptdisplay515602019759&ord=1673488353927&jv=1627953677&callback=BrandSafetyNadoscallback_20831714',
        'https://geo.moatads.com/n.js?e=35&ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&ql=&qo=0&i=VOX_PREBID_HEADER1&hp=1&wf=0&pxm=8&sgs=3&vb=-1&kq=2.625&hq=0&hs=0&hu=0&hr=0&ht=1&dnt=0&bq=11&f=0&j=&t=1673488351675&de=382553175948&rx=948497022904&m=0&ar=67fa5e2a4e8-clean&iw=55f8bf3&q=1&cb=1&cu=1673488351675&ll=2&lm=0&ln=0&em=0&en=0&d=undefined%3Aundefined%3Aundefined%3Aundefined&cm=1&zGSRS=1&zGSRC=1&gu=https%3A%2F%2Fwww.theverge.com%2F&id=1&ii=4&bo=undefined&bd=undefined&zMoatOrigSlicer1=undefined&zMoatOrigSlicer2=undefined&dfp=true&la=undefined&gw=voxprebidheader841653991752&fd=1&it=500&ti=0&ih=2&pe=1%3A189%3A189%3A0%3A135&jk=-1&jm=-1&fs=201243&na=256553637&cs=0&ord=1673488351675&jv=1766907827&callback=DOMlessLLDcallback_87887703',
        'https://geo.moatads.com/n.js?e=35&ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&ql=&qo=0&i=VOX_PREBID_HEADER1&hp=1&wf=0&pxm=8&sgs=3&vb=-1&kq=2.625&hq=0&hs=0&hu=0&hr=0&ht=1&dnt=0&bq=11&f=0&j=&t=1673488351675&de=382553175948&rx=948497022904&m=0&ar=67fa5e2a4e8-clean&iw=55f8bf3&q=2&cb=1&cu=1673488351675&ll=2&lm=0&ln=0&em=0&en=0&d=undefined%3Aundefined%3Aundefined%3Aundefined&cm=1&zGSRS=1&zGSRC=1&gu=https%3A%2F%2Fwww.theverge.com%2F&id=1&ii=4&bo=undefined&bd=undefined&zMoatOrigSlicer1=undefined&zMoatOrigSlicer2=undefined&dfp=true&la=undefined&gw=voxprebidheader841653991752&fd=1&it=500&ti=0&ih=2&pe=1%3A189%3A189%3A0%3A135&jk=-1&jm=-1&fs=201243&na=1637713924&cs=0&callback=MoatDataJsonpRequest_87887703',
        'https://mb.moatads.com/ot/v1?url=https%3A%2F%2Fwww.theverge.com%2F&pcode=moatot&ord=1673488353927&jv=1495680329&callback=OneTagNadoscallback_20831714',
        'https://mb.moatads.com/ii.js?lineItemId=5335564939&callback=lineItemInfo5335564939Callback_87887703',
        'https://mb.moatads.com/ii.js?lineItemId=5389138550&callback=lineItemInfo5389138550Callback_87887703',
        'https://www.google-analytics.com/plugins/ua/linkid.js',
        'https://d35xxde4fgg0cx.cloudfront.net/assets/embedded.js',
        'https://js-sec.indexww.com/ht/htw-pixel.gif?Y79n4agaKXcgT7zIMaazRQAA%262630=&us_privacy=1YNY',
        'https://sb.scorecardresearch.com/beacon.js',
        'https://px.owneriq.net/fr/epx.gif',
        'https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js',
        'https://www.theverge.com/',
        'https://www.theverge.com/_next/static/chunks/framework-36098b990598bc0c.js',
        'https://www.theverge.com/_next/static/chunks/pages/index-d573acb4aca49597.js',
        'https://theverge.com/',
        'https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.entries,Array.prototype.keys,Array.prototype.sort,Array.prototype.values,ArrayBuffer,ArrayBuffer.isView,Blob,console,CustomEvent,DataView,document,Element,Event,getComputedStyle,globalThis,IntersectionObserver,Intl,JSON,Math.clz32,modernizr:es6string,Object.getOwnPropertySymbols,Object.isExtensible,Object.isFrozen,Object.preventExtensions,Object.setPrototypeOf,queueMicrotask,Reflect.construct,Reflect.defineProperty,Reflect.get,Reflect.set,RegExp.prototype.flags,requestAnimationFrame,String.prototype.normalize,Symbol.for,Symbol.iterator,Symbol.prototype.description,Symbol.toPrimitive,Symbol.toStringTag,TextEncoder,Uint8Array,XMLHttpRequest,Intl.RelativeTimeFormat,Intl.RelativeTimeFormat.~locale.en',
        'https://www.theverge.com/_next/static/css/180bbf0a35dc54d6.css',
        'https://www.theverge.com/_next/static/chunks/main-c2d2dd866b4eefab.js',
        'https://www.theverge.com/null',
        'https://um.simpli.fi/lj_match?r=1673488353561&gdpr=0&gdpr_consent=',
        'https://nep.advangelists.com/xp/user-sync?acctid=405&redirect=https%3A%2F%2Fdsum-sec.casalemedia.com%2Fcrum%3Fcm_dsp_id%3D195%26external_user_id%3D%7BPARTNER_VISITOR_ID%7D%0A',
        'https://hymnal-prod.vox-cdn.com/libraries/underscore-min.map',
        'https://cdn.concert.io/lib/concert-ads/v2-latest/concert_ads.js.map',
        'https://ak.sail-horizon.com/spm/spm.v1.min.js.map',
      ];
      const displayurls = urls.map(u => {
        const hostname = new URL(u).hostname;

        // Make a nice reviewable snapshot to verify all cases are pleasing.
        return [
          u,
          `          (${hostname})`,
          `          ${' '.repeat(hostname.length)} ${UrlUtils.getURLDisplayName(u)}`,
        ].join('\n');
      });

      expect(displayurls.flat()).toMatchInlineSnapshot(`
Array [
  "https://ats.rlcdn.com/ats.js
          (ats.rlcdn.com)
                        /ats.js",
  "https://cdn.concert.io/lib/concert-ads/v2-latest/concert_ads.js
          (cdn.concert.io)
                         …v2-latest/concert_ads.js",
  "https://securepubads.g.doubleclick.net/gpt/pubads_impl_2023010501.js?cb=31071517
          (securepubads.g.doubleclick.net)
                                         /gpt/pubads_impl_202….js?cb=31071517",
  "https://z.moatads.com/stackadaptdisplay515602019759/moatad.js
          (z.moatads.com)
                        /stackadaptdisplay515…/moatad.js",
  "https://www.theverge.com/_next/static/chunks/47-c1d7449f7414bf61.js
          (www.theverge.com)
                           …chunks/47-c1d7449f7414bf61.js",
  "https://www.googletagservices.com/activeview/js/current/rx_lidar.js?cache=r20110914
          (www.googletagservices.com)
                                    …current/rx_lidar.js?cache=r20110914",
  "https://cdn.doubleverify.com/dv-measurements3398.js
          (cdn.doubleverify.com)
                               /dv-measurements3398.js",
  "https://micro.rubiconproject.com/prebid/dynamic/7470.js
          (micro.rubiconproject.com)
                                   …dynamic/7470.js",
  "https://z.moatads.com/voxprebidheader841653991752/moatheader.js
          (z.moatads.com)
                        /voxprebidheader841…/moatheader.js",
  "https://www.googletagmanager.com/gtag/js?id=G-9GXHZT6RVE&l=dataLayer&cx=c
          (www.googletagmanager.com)
                                   /gtag/js?id=G-9GXHZT6RVE&l=dataLayer&cx=c",
  "https://hymnal-prod.vox-cdn.com/ads/house_promotions_covid_19_content_link_promo_b302176a-5550-482a-8d62-e9be0489394e/ad.js
          (hymnal-prod.vox-cdn.com)
                                  …house_promotions_covid_19_content_link_promo_b302176a-5550-….js",
  "https://www.googleoptimize.com/optimize.js?id=GTM-54FC4VZ
          (www.googleoptimize.com)
                                 /optimize.js?id=GTM-54FC4VZ",
  "https://www.theverge.com/_next/static/chunks/pages/_app-692fa9c9a56fbbe9.js
          (www.theverge.com)
                           …pages/_app-692fa9c9a56fbbe9.js",
  "https://www.googletagmanager.com/gtm.js?id=GTM-WQ5FM5W
          (www.googletagmanager.com)
                                   /gtm.js?id=GTM-WQ5FM5W",
  "https://static.narrativ.com/tags/narrativ-pub.1.0.0.js
          (static.narrativ.com)
                              /tags/narrativ-pub.1.0.0.js",
  "https://c.amazon-adsystem.com/aax2/apstag.js
          (c.amazon-adsystem.com)
                                /aax2/apstag.js",
  "https://cdn.permutive.com/d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-web.js
          (cdn.permutive.com)
                            /d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-web.js",
  "https://www.theverge.com/_next/static/chunks/311-8bad5d5b0875fc8a.js
          (www.theverge.com)
                           …chunks/311-8bad5d5b0875fc8a.js",
  "https://analytics.rlcdn.com/
          (analytics.rlcdn.com)
                              /",
  "https://hymnal-prod.vox-cdn.com/libraries/underscore-1.5.1.min.js
          (hymnal-prod.vox-cdn.com)
                                  /libraries/underscore-1.5.1.min.js",
  "https://s3.amazonaws.com/stackadapt_public/js/saimp.js
          (s3.amazonaws.com)
                           …js/saimp.js",
  "https://mb.moatads.com/yi/v2?ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&url=https%3A%2F%2Fwww.theverge.com%2F&pcode=voxprebidheader841653991752&rx=948497022904&callback=MoatNadoAllJsonpRequest_87887703
          (mb.moatads.com)
                         ….com%2F&pcode=voxprebid…&rx=948…&callback=MoatNadoA…",
  "https://hymnal-prod.vox-cdn.com/thumbor/61Zkv7zmS91LwBeYGCFuI-W33iE=/fit-in/600x600/hymnal-prod.vox-cdn.com/uploads/asset/file/100962/justvox.jpg
          (hymnal-prod.vox-cdn.com)
                                  …100962/justvox.jpg",
  "https://www.googletagservices.com/tag/js/gpt.js
          (www.googletagservices.com)
                                    …js/gpt.js",
  "https://pagead2.googlesyndication.com/bg/sU6CjPDj0xr2jbZF4y7IwEoRNSn0ddnQS8nRuvxnxiY.js
          (pagead2.googlesyndication.com)
                                        /bg/sU6CjPDj0….js",
  "https://pub.doubleverify.com/signals/pub.js
          (pub.doubleverify.com)
                               /signals/pub.js",
  "https://cdn.permutive.com/models/v2/d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-models.bin
          (cdn.permutive.com)
                            …v2/d2fb08da-1c03-4c8a-978f-ad8a96b4c31f-models.bin",
  "https://z.moatads.com/voxcustomdfp152282307853/moatad.js
          (z.moatads.com)
                        /voxcustomdfp152…/moatad.js",
  "https://cdn.concert.io/lib/bids/browserify-consent-string.js
          (cdn.concert.io)
                         …bids/browserify-consent-string.js",
  "https://cdn.concert.io/lib/concert-concierge.2.10.1.min.js
          (cdn.concert.io)
                         /lib/concert-concierge.2.10.1.min.js",
  "https://eus.rubiconproject.com/usync.js
          (eus.rubiconproject.com)
                                 /usync.js",
  "https://ads.rubiconproject.com/prebid/creative.js
          (ads.rubiconproject.com)
                                 /prebid/creative.js",
  "https://cdn.parsely.com/keys/theverge.com/p.js
          (cdn.parsely.com)
                          …theverge.com/p.js",
  "https://duet-cdn.vox-cdn.com/thumbor/0x0:2040x1360/750x600/filters:focal(1020x680:1021x681):format(webp)/cdn.vox-cdn.com/uploads/chorus_asset/file/24037424/226274_APPLE_WATCH_ULTRA_PHO_akrales_0581.jpg
          (duet-cdn.vox-cdn.com)
                               …24037424/226274_AP….jpg",
  "https://hymnal-prod.vox-cdn.com/libraries/jquery-1.10.2.min.gz.js
          (hymnal-prod.vox-cdn.com)
                                  /libraries/jquery-1.10.2.min.gz.js",
  "https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/844c0e39171612fac32bcdd5ada42603.jpg
          (html.stackadapt.com)
                              …images/844c0e3….jpg",
  "https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/a8cb7df9b005b56d9c09701777d4a257.jpg
          (html.stackadapt.com)
                              …images/a8cb7df….jpg",
  "https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/046a4be2555b0fbdeab0493c7bd3ccb9.js
          (html.stackadapt.com)
                              …300x250/046a4be….js",
  "https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/094960b3cbb51fe1f9345472b3304207.jpg
          (html.stackadapt.com)
                              …images/094960b….jpg",
  "https://ak.sail-horizon.com/spm/spm.v1.min.js
          (ak.sail-horizon.com)
                              /spm/spm.v1.min.js",
  "https://js-sec.indexww.com/ht/p/183789-71940066017360.js
          (js-sec.indexww.com)
                             …p/183789-719….js",
  "https://acdn.adnxs.com/dmp/async_usersync.html
          (acdn.adnxs.com)
                         /dmp/async_usersync.html",
  "https://www.google-analytics.com/analytics.js
          (www.google-analytics.com)
                                   /analytics.js",
  "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2
          (fonts.gstatic.com)
                            …v30/KFOlCnqEu….woff2",
  "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2
          (fonts.gstatic.com)
                            …v20/pxiByp8kv….woff2",
  "https://static.ads-twitter.com/uwt.js
          (static.ads-twitter.com)
                                 /uwt.js",
  "https://ads.pubmatic.com/AdServer/js/user_sync.html?p=156011&s=165626&predirect=https%3A%2F%2Fs.amazon-adsystem.com%2Fecm3%3Fex%3Dpubmatic.com%26id%3DPM_UID
          (ads.pubmatic.com)
                           …js/user_sync.html?p=…",
  "https://ads.pubmatic.com/AdServer/js/user_sync.html?kdntuid=1&p=159303&us_privacy=1YNY
          (ads.pubmatic.com)
                           …js/user_sync.html?kdntuid=1&p=159303&us_privacy=1YNY",
  "https://static.scroll.com/js/scroll.js
          (static.scroll.com)
                            /js/scroll.js",
  "https://cdn.doubleverify.com/dvtp_src.js?t2te=0&seltag=1&adsrv=104&cmp=DV510213&ctx=21236410&sadv=48933784&ord=2702456324&litm=5389138550&scrt=138313703890&splc=/172968584/verge/front_page&adu=172393864&unit=1x1&dvp_qtpid=78ac1313-9b7f-43a3-a207-466adfafe89c&dvp_qtsid=4532a35a-8daa-4b9b-95a5-9d10e016ab80&btreg=5389138550138313703890&btadsrv=5389138550138313703890&spos=&c1=front-page&c2=&c3=&c4=home_page&c5=14285,14373,23231,23238,27179,29301,33252,34913,34914,34916,34917,37532,38622,46766,52409,55836,56587,73555,88725,112273,112274,112275,112276,112277,112278,112280,112281,112282,112376,112632,112800,rts&c6=list_51,list_89,list_98,list_129,list_200,list_206,list_324,list_325,list_394,list_466,list_528,list_536,list_537,list_591,list_603,list_674,list_676,list_685,list_772,list_773,list_777,list_781,list_807,list_875,list_879,list_895,list_902,list_909,list_959,list_999,list_1023,list_1065,list_1117,list_1125,list_1246,list_1286,list_1329,list_1330,list_1334,list_1345,list_1382,list_1383,list_1387,list_1396,list_1450&c7=26,26.4,26.4.3,26.3,26.4.1
          (cdn.doubleverify.com)
                               /dvtp_src.js?t2te=…",
  "https://html.stackadapt.com/HBR/JULY2020/Domestic/300x250/images/cbaae8cca2cada92d99c50fec9b72810.png
          (html.stackadapt.com)
                              …images/cbaae8c….png",
  "https://creative.stackadapt.com/icons/adchoices/adchoices.png
          (creative.stackadapt.com)
                                  …adchoices/adchoices.png",
  "https://s3.amazonaws.com/stackadapt_public/js/saurl.js
          (s3.amazonaws.com)
                           …js/saurl.js",
  "https://uw.srv.stackadapt.com/cookie?campid=258451&nativeid=2249172&domain=theverge.com%3A%3A94&auctionid=1-9205-167348835284906087300089-2&impindex=0&m=NzMuMjQxLjEwMS43MQ&isipgen=0&conv=1
          (uw.srv.stackadapt.com)
                                /cookie?campid=…",
  "https://creative.stackadapt.com/js/cat.js
          (creative.stackadapt.com)
                                  /js/cat.js",
  "https://pr-bh.ybp.yahoo.com/sync/casale/Y79n4agaKXcgT7zIMaazRQAACkYAAAAB?gdpr_consent=&us_privacy=&gdpr=
          (pr-bh.ybp.yahoo.com)
                              …casale/Y79n4agaK…?gdpr_consent=&us_privacy=&gdpr=",
  "https://px.ads.linkedin.com/setuid?partner=rubiconDb&dbredirect=true&ruxId=LCSFR9X8-15-GFYC
          (px.ads.linkedin.com)
                              /setuid?partner=rubiconDb&dbredirect=true&ruxId=LCSFR9X8-15-GFYC",
  "https://www.facebook.com/tr/?id=594981607301768&ev=PixelInitialized&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=&if=false&ts=1673488352379
          (www.facebook.com)
                           /tr/?id=…",
  "https://uw.srv.stackadapt.com/cv?aid=1-9205-167348835284906087300089-2&iidx=0&cv=%20%22%22&iv=ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00f7fa28a2803fffd994c3a5a6175945015a237e68ba60993549f16547
          (uw.srv.stackadapt.com)
                                /cv?aid=1-9205-1673488…-2&iidx=0&cv=%20%22%22&iv=ffd8ffe…",
  "https://uw.srv.stackadapt.com/track_user_page?aid=1-9205-167348835284906087300089-2&iid=1&br_domain=theverge.com&br_ip=73.241.101.71&window_location_href=https%3A%2F%2Fwww.theverge.com%2F&top_location_href=https%3A%2F%2Fwww.theverge.com%2F&is_iframe=true&network=index&br_page_url=https://www.theverge.com/
          (uw.srv.stackadapt.com)
                                /track_user_page?aid=…",
  "https://www.facebook.com/tr/?id=594981607301768&ev=PixelInitialized&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=https%3A%2F%2Fwww.theverge.com%2F&if=false&ts=1673488352735
          (www.facebook.com)
                           /tr/?id=…",
  "https://www.facebook.com/tr/?id=null&ev=6026192431231&dl=https%3A%2F%2Fwww.theverge.com%2F&rl=&if=false&ts=1673488352379&cd[value]=1.00&cd[currency]=USD
          (www.facebook.com)
                           /tr/?id=…",
  "https://s.amazon-adsystem.com/x/757c0557066e95cfd4c7?gdpr=0&gdpr_consent=&uid=3212683525146180232798
          (s.amazon-adsystem.com)
                                /x/757c055…?gdpr=0&gdpr_consent=&uid=3212683…",
  "https://uw.evm1.stackadapt.com/win?aid=1-9205-167348835284906087300089-2&sid=1&wp=0.79&rid=1f052c40-c34a-4bee-b1a3-2427e8f7943a&network=94&t=1673488352&said=1-9205-167348835284906087300089-2&sanid=94
          (uw.evm1.stackadapt.com)
                                 /win?aid=…",
  "https://d.adroll.com/cm/index/tp_out?advertisable=3GMDZMBFQREVBC75SYYKWH
          (d.adroll.com)
                       …index/tp_out?advertisable=3GMDZMBFQREVBC75SYYKWH",
  "https://mb.moatads.com/s/v2?url=https%3A%2F%2Fwww.theverge.com%2F&pcode=stackadaptdisplay515602019759&ord=1673488353927&jv=1627953677&callback=BrandSafetyNadoscallback_20831714
          (mb.moatads.com)
                         /s/v2?url=…",
  "https://geo.moatads.com/n.js?e=35&ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&ql=&qo=0&i=VOX_PREBID_HEADER1&hp=1&wf=0&pxm=8&sgs=3&vb=-1&kq=2.625&hq=0&hs=0&hu=0&hr=0&ht=1&dnt=0&bq=11&f=0&j=&t=1673488351675&de=382553175948&rx=948497022904&m=0&ar=67fa5e2a4e8-clean&iw=55f8bf3&q=1&cb=1&cu=1673488351675&ll=2&lm=0&ln=0&em=0&en=0&d=undefined%3Aundefined%3Aundefined%3Aundefined&cm=1&zGSRS=1&zGSRC=1&gu=https%3A%2F%2Fwww.theverge.com%2F&id=1&ii=4&bo=undefined&bd=undefined&zMoatOrigSlicer1=undefined&zMoatOrigSlicer2=undefined&dfp=true&la=undefined&gw=voxprebidheader841653991752&fd=1&it=500&ti=0&ih=2&pe=1%3A189%3A189%3A0%3A135&jk=-1&jm=-1&fs=201243&na=256553637&cs=0&ord=1673488351675&jv=1766907827&callback=DOMlessLLDcallback_87887703
          (geo.moatads.com)
                          /n.js?e=…",
  "https://geo.moatads.com/n.js?e=35&ol=0&qn=%604%7BZEYwoqI%24%5BK%2BdLLU)%2CMm~tB%23Z.%5BMhS%3A15.snbvOJ!n%3DN_QH2%3Ev%3EhhX%2FIX%5EpB1I%3Cq.bWol5%7D9%250m9%7CI4%3CeZs%3DHZk3L3zvcR%5EGgh6%3D1vU3*%5B7bPpRE%60K5%5D0cxz%3B(IA%24Jz_%7CX_h)G%3E3%5D*%25%3BhyzBcM1q4%2Cby_h%3BNpIu%7Czvcp%3B%5Bpwxnd5H%241%5ETmZi%3Di%22%3Bh%2C1vU3%23_uCTpe4tE0b15%7CQjw%60.%7BiQ%23%40.%5BoVBN%26w_q6!L%3A%2F%3Cv%3EhlTr1W*d%5B4kf%2FLyUoRdByZ%3CPnKMV%25%3C%2Cbq.%22oDOk%2Cz%25GY&tf=1_nMzjG---CSa7H-1SJH-bW7qhB-LRwqH-nMzjG-&vi=111111&rc=0%2C1%2C0%2C0%2C0%2C1%2C0%2C0%2Cprobably%2Cprobably&rb=1-u0Lpr1teFlxSeIKWBFuET31Epk3Oj90BFaPgx%2FCwrOl2tvnQIISF3cA%2B&rs=1-Z9pXKgp%2BRPoJWg%3D%3D&sc=1&os=1-YQ%3D%3D&qp=10000&is=BBBBB2BBEYBvGl2BBCkqtUTE1RmsqbKW8BsrBu0rCFE48CRBeeBS2hWTMBBQeQBBn2soYggyUig0CBlWZ0uBBCCCCCCOgRBBiOfnE6Bkg7Oxib8MxOtJYHCBdm5kBhIcC9Y8oBXckXBR76iUUsJBCBBBBBBBBBWBBBj3BBBZeGV2BBBCMciUBBBjgEBBBBBB94UMgTdJMtEcpMBBBQBBBniOccBBBBBB47kNwxBbBBBBBBBBBhcjG6BBJM2L4Bk8BwCBQmIoRBBCzBz1BBCTClBBrbGB94ehueB57NG9aJfR0BqEKiuwBBBB&iv=8&qt=0&gz=0&hh=0&hn=0&tw=&qc=0&qd=0&qf=370&qe=658&qh=360&qg=640&qm=480&qa=360&qb=640&qi=360&qj=640&to=000&po=1-0020002000002120&vy=ot%24b%5Bh%40%22oDgO%3DLlE6%3AvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2%3D%40PyqIY79%22bR9%2F%24b%3CDL54%25w(TvTptJe3Ia%7B!Tw!%3Ari8R4%3C(a4%5D%24cr16Zh5Yi3Mp%3E_Y%7B!7IQ3HbmUZzCFm%5Du!x2U%3BvyiA%24%3AFAx2d%5E%2FNrUd%3FWxj%5Du!x2G%60B&qr=0&ql=&qo=0&i=VOX_PREBID_HEADER1&hp=1&wf=0&pxm=8&sgs=3&vb=-1&kq=2.625&hq=0&hs=0&hu=0&hr=0&ht=1&dnt=0&bq=11&f=0&j=&t=1673488351675&de=382553175948&rx=948497022904&m=0&ar=67fa5e2a4e8-clean&iw=55f8bf3&q=2&cb=1&cu=1673488351675&ll=2&lm=0&ln=0&em=0&en=0&d=undefined%3Aundefined%3Aundefined%3Aundefined&cm=1&zGSRS=1&zGSRC=1&gu=https%3A%2F%2Fwww.theverge.com%2F&id=1&ii=4&bo=undefined&bd=undefined&zMoatOrigSlicer1=undefined&zMoatOrigSlicer2=undefined&dfp=true&la=undefined&gw=voxprebidheader841653991752&fd=1&it=500&ti=0&ih=2&pe=1%3A189%3A189%3A0%3A135&jk=-1&jm=-1&fs=201243&na=1637713924&cs=0&callback=MoatDataJsonpRequest_87887703
          (geo.moatads.com)
                          /n.js?e=…",
  "https://mb.moatads.com/ot/v1?url=https%3A%2F%2Fwww.theverge.com%2F&pcode=moatot&ord=1673488353927&jv=1495680329&callback=OneTagNadoscallback_20831714
          (mb.moatads.com)
                         /ot/v1?ur….com%2F&pcode=…",
  "https://mb.moatads.com/ii.js?lineItemId=5335564939&callback=lineItemInfo5335564939Callback_87887703
          (mb.moatads.com)
                         /ii.js?lineItemId=533…&callback=lineItemI…",
  "https://mb.moatads.com/ii.js?lineItemId=5389138550&callback=lineItemInfo5389138550Callback_87887703
          (mb.moatads.com)
                         /ii.js?lineItemId=538…&callback=lineItemI…",
  "https://www.google-analytics.com/plugins/ua/linkid.js
          (www.google-analytics.com)
                                   …ua/linkid.js",
  "https://d35xxde4fgg0cx.cloudfront.net/assets/embedded.js
          (d35xxde4fgg0cx.cloudfront.net)
                                        /assets/embedded.js",
  "https://js-sec.indexww.com/ht/htw-pixel.gif?Y79n4agaKXcgT7zIMaazRQAA%262630=&us_privacy=1YNY
          (js-sec.indexww.com)
                             /ht/htw-pixel.gif?Y79n4agaK…%262630=&us_privacy=1YNY",
  "https://sb.scorecardresearch.com/beacon.js
          (sb.scorecardresearch.com)
                                   /beacon.js",
  "https://px.owneriq.net/fr/epx.gif
          (px.owneriq.net)
                         /fr/epx.gif",
  "https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
          (cdn.jsdelivr.net)
                           …src/js.cookie.min.js",
  "https://www.theverge.com/
          (www.theverge.com)
                           /",
  "https://www.theverge.com/_next/static/chunks/framework-36098b990598bc0c.js
          (www.theverge.com)
                           …chunks/framework-36098b990598bc0c.js",
  "https://www.theverge.com/_next/static/chunks/pages/index-d573acb4aca49597.js
          (www.theverge.com)
                           …pages/index-d573acb4aca49597.js",
  "https://theverge.com/
          (theverge.com)
                       /",
  "https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.entries,Array.prototype.keys,Array.prototype.sort,Array.prototype.values,ArrayBuffer,ArrayBuffer.isView,Blob,console,CustomEvent,DataView,document,Element,Event,getComputedStyle,globalThis,IntersectionObserver,Intl,JSON,Math.clz32,modernizr:es6string,Object.getOwnPropertySymbols,Object.isExtensible,Object.isFrozen,Object.preventExtensions,Object.setPrototypeOf,queueMicrotask,Reflect.construct,Reflect.defineProperty,Reflect.get,Reflect.set,RegExp.prototype.flags,requestAnimationFrame,String.prototype.normalize,Symbol.for,Symbol.iterator,Symbol.prototype.description,Symbol.toPrimitive,Symbol.toStringTag,TextEncoder,Uint8Array,XMLHttpRequest,Intl.RelativeTimeFormat,Intl.RelativeTimeFormat.~locale.en
          (polyfill.io)
                      /v3/polyfill.min.js?features=…",
  "https://www.theverge.com/_next/static/css/180bbf0a35dc54d6.css
          (www.theverge.com)
                           …css/180bbf0a35dc54d6.css",
  "https://www.theverge.com/_next/static/chunks/main-c2d2dd866b4eefab.js
          (www.theverge.com)
                           …chunks/main-c2d2dd866b4eefab.js",
  "https://www.theverge.com/null
          (www.theverge.com)
                           /null",
  "https://um.simpli.fi/lj_match?r=1673488353561&gdpr=0&gdpr_consent=
          (um.simpli.fi)
                       /lj_match?r=167…&gdpr=0&gdpr_consent=",
  "https://nep.advangelists.com/xp/user-sync?acctid=405&redirect=https%3A%2F%2Fdsum-sec.casalemedia.com%2Fcrum%3Fcm_dsp_id%3D195%26external_user_id%3D%7BPARTNER_VISITOR_ID%7D%0A
          (nep.advangelists.com)
                               /xp/user-sync?acctid=…",
  "https://hymnal-prod.vox-cdn.com/libraries/underscore-min.map
          (hymnal-prod.vox-cdn.com)
                                  /libraries/underscore-min.map",
  "https://cdn.concert.io/lib/concert-ads/v2-latest/concert_ads.js.map
          (cdn.concert.io)
                         …v2-latest/concert_ads.js.map",
  "https://ak.sail-horizon.com/spm/spm.v1.min.js.map
          (ak.sail-horizon.com)
                              /spm/spm.v1.min.js.map",
]
`);
    });
  });

  describe('elideDataURI', () => {
    it('elides long data URIs', () => {
      let longDataURI = '';
      for (let i = 0; i < 1000; i++) {
        longDataURI += 'abcde';
      }

      const elided = UrlUtils.elideDataURI(`data:image/jpeg;base64,${longDataURI}`);
      assert.ok(elided.length < longDataURI.length, 'did not shorten string');
    });

    it('returns all other inputs', () => {
      const urls = [
        'data:image/jpeg;base64,foobar',
        'https://example.com/page?query=string#hash',
        'http://example-2.com',
        'chrome://settings',
        'blob://something',
      ];

      urls.forEach(url => assert.equal(UrlUtils.elideDataURI(url), url));
    });
  });

  describe('equalWithExcludedFragments', () => {
    it('correctly checks equality of URLs regardless of fragment', () => {
      const equalPairs = [
        ['https://example.com/', 'https://example.com/'],
        ['https://example.com/', 'https://example.com/#/login?_k=dt915a'],
        ['https://example.com/', 'https://example.com#anchor'],
      ];
      equalPairs.forEach(pair => assert.ok(UrlUtils.equalWithExcludedFragments(...pair)));
    });

    it('correctly checks inequality of URLs regardless of fragment', () => {
      const unequalPairs = [
        ['https://example.com/', 'https://www.example.com/'],
        ['https://example.com/', 'http://example.com/'],
        ['https://example.com/#/login?_k=dt915a', 'https://example.com/index.html#/login?_k=dt915a'],
        ['https://example.com#anchor', 'https://example.com?t=1#anchor'],
      ];
      unequalPairs.forEach(pair => assert.ok(!UrlUtils.equalWithExcludedFragments(...pair)));
    });

    // Bug #1776
    it('rewrites chrome://settings urls', () => {
      const pair = [
        'chrome://settings/',
        'chrome://chrome/settings/',
      ];
      assert.ok(UrlUtils.equalWithExcludedFragments(...pair));
    });

    // https://github.com/GoogleChrome/lighthouse/pull/3941#discussion_r154026009
    it('canonicalizes chrome:// urls without a trailing slash', () => {
      const pair = [
        'chrome://version/',
        'chrome://version',
      ];
      assert.ok(UrlUtils.equalWithExcludedFragments(...pair));
    });

    it('returns false for invalid URLs', () => {
      assert.ok(!UrlUtils.equalWithExcludedFragments('utter nonsense', 'http://example.com'));
    });
  });

  it('isLikeLocalhost', () => {
    assert.ok(UrlUtils.isLikeLocalhost(new URL('http://localhost/').hostname));
    assert.ok(UrlUtils.isLikeLocalhost(new URL('http://localhost:10200/').hostname));
    assert.ok(UrlUtils.isLikeLocalhost(new URL('http://127.0.0.1/page.html').hostname));
    assert.ok(UrlUtils.isLikeLocalhost(new URL('https://localhost/').hostname));
    assert.ok(UrlUtils.isLikeLocalhost(new URL('https://dev.localhost/').hostname));

    assert.ok(!UrlUtils.isLikeLocalhost(new URL('http://8.8.8.8/').hostname));
    assert.ok(!UrlUtils.isLikeLocalhost(new URL('http://example.com/').hostname));
  });

  it('isSecureScheme', () => {
    assert.ok(UrlUtils.isSecureScheme('wss'));
    assert.ok(UrlUtils.isSecureScheme('about'));
    assert.ok(UrlUtils.isSecureScheme('data'));
    assert.ok(UrlUtils.isSecureScheme('filesystem'));

    assert.ok(!UrlUtils.isSecureScheme('http'));
    assert.ok(!UrlUtils.isSecureScheme('ws'));
  });

  it('isNonNetworkProtocol', () => {
    assert.ok(UrlUtils.isNonNetworkProtocol('blob'));
    assert.ok(UrlUtils.isNonNetworkProtocol('data'));
    assert.ok(UrlUtils.isNonNetworkProtocol('data:'));
    assert.ok(UrlUtils.isNonNetworkProtocol('intent:'));
    assert.ok(UrlUtils.isNonNetworkProtocol('file:'));
    assert.ok(UrlUtils.isNonNetworkProtocol('filesystem:'));
    assert.ok(UrlUtils.isNonNetworkProtocol('filesystem'));
    assert.ok(UrlUtils.isNonNetworkProtocol('chrome-extension'));

    assert.ok(!UrlUtils.isNonNetworkProtocol('https:'));
    assert.ok(!UrlUtils.isNonNetworkProtocol('http'));
    assert.ok(!UrlUtils.isNonNetworkProtocol('ws'));
  });

  describe('guessMimeType', () => {
    it('handles invalid url', () => {
      expect(UrlUtils.guessMimeType('')).toEqual(undefined);
      expect(UrlUtils.guessMimeType('I_AM_NO_URL')).toEqual(undefined);
    });

    it('uses mime type from data URI', () => {
      expect(UrlUtils.guessMimeType('data:image/png;DATA')).toEqual('image/png');
      expect(UrlUtils.guessMimeType('data:image/jpeg;DATA')).toEqual('image/jpeg');
      expect(UrlUtils.guessMimeType('data:image/svg+xml;DATA')).toEqual('image/svg+xml');
      expect(UrlUtils.guessMimeType('data:image/svg+xml,DATA')).toEqual('image/svg+xml');
      expect(UrlUtils.guessMimeType('data:text/html;DATA')).toEqual(undefined);
      expect(UrlUtils.guessMimeType('data:image/jpg;DATA')).toEqual(undefined);
      expect(UrlUtils.guessMimeType('data:text/plain,image/png;base64,DATA')).toEqual(undefined);
    });

    it('uses path extension for normal files', () => {
      expect(UrlUtils.guessMimeType('https://example.com/img.png')).toEqual('image/png');
      expect(UrlUtils.guessMimeType('https://example.com/img.png?test')).toEqual('image/png');
      expect(UrlUtils.guessMimeType('https://example.com/IMG.PNG')).toEqual('image/png');
      expect(UrlUtils.guessMimeType('https://example.com/img.jpeg')).toEqual('image/jpeg');
      expect(UrlUtils.guessMimeType('https://example.com/img.jpg')).toEqual('image/jpeg');
      expect(UrlUtils.guessMimeType('https://example.com/img.svg')).toEqual('image/svg+xml');
      expect(UrlUtils.guessMimeType('https://example.com/page.html')).toEqual(undefined);
      expect(UrlUtils.guessMimeType('https://example.com/')).toEqual(undefined);
    });
  });

  describe('normalizeUrl', () => {
    it('returns normalized URL', () => {
      expect(UrlUtils.normalizeUrl('https://example.com')).toEqual('https://example.com/');
    });

    it('rejects when not given a URL', () => {
      expect(() => {
        UrlUtils.normalizeUrl(undefined);
      }).toThrow('INVALID_URL');
    });

    it('rejects when given a URL of zero length', () => {
      expect(() => {
        UrlUtils.normalizeUrl('');
      }).toThrow('INVALID_URL');
    });

    it('rejects when given a URL without protocol', () => {
      expect(() => {
        UrlUtils.normalizeUrl('localhost');
      }).toThrow('INVALID_URL');
    });

    it('rejects when given a URL without hostname', () => {
      expect(() => {
        UrlUtils.normalizeUrl('https://');
      }).toThrow('INVALID_URL');
    });
  });
});
