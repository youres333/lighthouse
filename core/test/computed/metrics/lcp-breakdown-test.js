/**
 * @license Copyright 2023 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {LCPBreakdown} from '../../../computed/metrics/lcp-breakdown.js';
import {createTestTrace} from '../../create-test-trace.js';
import {networkRecordsToDevtoolsLog} from '../../network-records-to-devtools-log.js';
import {defaultSettings} from '../../../config/constants.js';
import {getURLArtifactFromDevtoolsLog, readJson} from '../../test-utils.js';

const textLcpTrace = readJson('../../fixtures/traces/frame-metrics-m90.json', import.meta);
const textLcpDevtoolsLog = readJson('../../fixtures/traces/frame-metrics-m90.devtools.log.json', import.meta);
const imageLcpTrace = readJson('../../fixtures/traces/amp-m86.trace.json', import.meta);
const imageLcpDevtoolsLog = readJson('../../fixtures/traces/amp-m86.devtoolslog.json', import.meta);

const requestedUrl = 'http://example.com:3000';
const mainDocumentUrl = 'http://www.example.com:3000';

const scriptUrl = 'http://www.example.com/script.js';
const imageUrl = 'http://www.example.com/image.png';

function mockData(networkRecords) {
  return {
    settings: JSON.parse(JSON.stringify(defaultSettings)),
    trace: createTestTrace({
      traceEnd: 6000,
      largestContentfulPaint: 4500,
    }),
    devtoolsLog: networkRecordsToDevtoolsLog(networkRecords),
    URL: {
      requestedUrl,
      mainDocumentUrl,
      finalDisplayedUrl: mainDocumentUrl,
    },
    gatherContext: {gatherMode: 'navigation'},
  };
}

function mockNetworkRecords() {
  return [{
    requestId: '2',
    priority: 'High',
    isLinkPreload: false,
    networkRequestTime: 0,
    networkEndTime: 500,
    timing: {sendEnd: 0, receiveHeadersEnd: 500},
    transferSize: 400,
    url: requestedUrl,
    frameId: 'ROOT_FRAME',
  },
  {
    requestId: '2:redirect',
    resourceType: 'Document',
    priority: 'High',
    isLinkPreload: false,
    networkRequestTime: 500,
    responseHeadersEndTime: 800,
    networkEndTime: 1000,
    timing: {sendEnd: 0, receiveHeadersEnd: 300},
    transferSize: 16_000,
    url: mainDocumentUrl,
    frameId: 'ROOT_FRAME',
  },
  {
    requestId: '3',
    resourceType: 'Script',
    priority: 'High',
    isLinkPreload: false,
    networkRequestTime: 1000,
    networkEndTime: 2000,
    transferSize: 32_000,
    url: scriptUrl,
    initiator: {type: 'parser', url: mainDocumentUrl},
    frameId: 'ROOT_FRAME',
  },
  {
    requestId: '4',
    resourceType: 'Image',
    priority: 'High',
    isLinkPreload: false,
    networkRequestTime: 2000,
    networkEndTime: 4500,
    transferSize: 640_000,
    url: imageUrl,
    initiator: {type: 'script', url: scriptUrl},
    frameId: 'ROOT_FRAME',
  }];
}

describe('LCPBreakdown', () => {
  it('returns breakdown for a real trace with image LCP', async () => {
    const data = {
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      trace: imageLcpTrace,
      devtoolsLog: imageLcpDevtoolsLog,
      URL: getURLArtifactFromDevtoolsLog(imageLcpDevtoolsLog),
      gatherContext: {gatherMode: 'navigation'},
    };

    const result = await LCPBreakdown.request(data, {computedCache: new Map()});

    expect(result.ttfb).toBeCloseTo(2393.7, 0.1);
    expect(result.loadStart).toBeCloseTo(5396.6, 0.1);
    expect(result.loadEnd).toBeCloseTo(5518.5, 0.1);
  });

  it('returns breakdown for a real trace with text LCP', async () => {
    const data = {
      settings: JSON.parse(JSON.stringify(defaultSettings)),
      trace: textLcpTrace,
      devtoolsLog: textLcpDevtoolsLog,
      URL: getURLArtifactFromDevtoolsLog(textLcpDevtoolsLog),
      gatherContext: {gatherMode: 'navigation'},
    };

    const result = await LCPBreakdown.request(data, {computedCache: new Map()});

    expect(result.ttfb).toBeCloseTo(1014.7, 0.1);
    expect(result.loadStart).toBeUndefined();
    expect(result.loadEnd).toBeUndefined();
  });

  it('returns breakdown for image LCP', async () => {
    const networkRecords = mockNetworkRecords();
    const data = mockData(networkRecords);

    const result = await LCPBreakdown.request(data, {computedCache: new Map()});

    expect(result.ttfb).toBeCloseTo(800, 0.1);
    expect(result.loadStart).toBeCloseTo(2578.2, 0.1);
    expect(result.loadEnd).toBeCloseTo(5801, 0.1);
  });

  it('returns observed for image LCP', async () => {
    const networkRecords = mockNetworkRecords();
    const data = mockData(networkRecords);
    data.settings.throttlingMethod = 'provided';

    const result = await LCPBreakdown.request(data, {computedCache: new Map()});

    expect(result.ttfb).toBeCloseTo(800, 0.1);
    expect(result.loadStart).toBeCloseTo(2000, 0.1);
    expect(result.loadEnd).toBeCloseTo(4500, 0.1);
  });

  it('returns breakdown for text LCP', async () => {
    const networkRecords = mockNetworkRecords();
    const data = mockData(networkRecords);
    const eventIndex =
      data.trace.traceEvents.findIndex(e => e.name === 'LargestImagePaint::Candidate');
    data.trace.traceEvents.splice(eventIndex, 1);

    const result = await LCPBreakdown.request(data, {computedCache: new Map()});

    expect(result.ttfb).toBeCloseTo(800, 0.1);
    expect(result.loadStart).toBeUndefined();
    expect(result.loadEnd).toBeUndefined();
  });

  it('throws if there was no LCP', async () => {
    const networkRecords = mockNetworkRecords();
    const data = mockData(networkRecords);
    const eventIndex =
      data.trace.traceEvents.findIndex(e => e.name === 'largestContentfulPaint::Candidate');
    data.trace.traceEvents.splice(eventIndex, 1);

    const resultPromise = LCPBreakdown.request(data, {computedCache: new Map()});

    await expect(resultPromise).rejects.toThrow('NO_LCP');
  });
});
