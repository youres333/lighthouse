/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {DocumentUrls} from '../../computed/document-urls.js';
import {networkRecordsToDevtoolsLog} from '../network-records-to-devtools-log.js';
import {createTestTrace} from '../create-test-trace.js';

describe('DocumentUrls', () => {
  it('should resolve redirects with multiple navStarts', async () => {
    const trace = createTestTrace({
      frameUrl: 'https://www.example.com/',
      navigationId: '0',
    });
    const navStartEvt = trace.traceEvents.find(e => e.name === 'navigationStart');

    const nextNavStart = JSON.parse(JSON.stringify(navStartEvt));
    nextNavStart.args.data.documentLoaderURL = 'https://page.example.com/';
    nextNavStart.args.data.navigationId = '1';
    nextNavStart.ts++;
    trace.traceEvents.push(nextNavStart);

    const devtoolsLog = networkRecordsToDevtoolsLog([
      {requestId: '0', url: 'http://example.com/'},
      {requestId: '0:redirect', url: 'https://example.com/'},
      {requestId: '0:redirect:redirect', url: 'https://www.example.com/'},
      {requestId: '1', url: 'https://page.example.com/'},
    ]);

    const URL = await DocumentUrls.request({devtoolsLog, trace}, {computedCache: new Map()});
    expect(URL).toEqual({
      requestedUrl: 'http://example.com/',
      mainDocumentUrl: 'https://page.example.com/',
    });
  });

  it('should resolve HTTP redirects (single navStart)', async () => {
    const trace = createTestTrace({
      frameUrl: 'https://www.example.com/',
      navigationId: '0',
    });
    const devtoolsLog = networkRecordsToDevtoolsLog([
      {requestId: '0', url: 'http://example.com/'},
      {requestId: '0:redirect', url: 'https://example.com/'},
      {requestId: '0:redirect:redirect', url: 'https://www.example.com/'},
    ]);

    const URL = await DocumentUrls.request({devtoolsLog, trace}, {computedCache: new Map()});
    expect(URL).toEqual({
      requestedUrl: 'http://example.com/',
      mainDocumentUrl: 'https://www.example.com/',
    });
  });
});
