/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import {NetworkAnalysis} from '../../computed/network-analysis.js';
import {readJson} from '../test-utils.js';

const acceptableDevToolsLog = readJson('../fixtures/traces/progressive-app-m60.devtools.log.json', import.meta);

describe('Network analysis computed', () => {
  it('should return network analysis', async () => {
    const result = await NetworkAnalysis.request(acceptableDevToolsLog, {computedCache: new Map()});

    expect(Math.round(result.rtt)).toEqual(3);
    expect(Math.round(result.throughput)).toEqual(1628070);
    expect(result.additionalRttByOrigin).toMatchInlineSnapshot(`
Map {
  "https://pwa.rocks" => 0.3960000176447025,
  "https://www.googletagmanager.com" => 0,
  "https://www.google-analytics.com" => 1.0450000117997007,
  "__SUMMARY__" => 0,
}
`);
    expect(result.serverResponseTimeByOrigin).toMatchInlineSnapshot(`
Map {
  "https://pwa.rocks" => 159.70249997917608,
  "https://www.googletagmanager.com" => 153.03200000198592,
  "https://www.google-analytics.com" => 159.5549999910874,
  "__SUMMARY__" => 159.48849997948884,
}
`);
  });

  it('should be robust enough to handle missing data', async () => {
    const mutatedLog = acceptableDevToolsLog.map(entry => {
      if (entry.method !== 'Network.responseReceived') return entry;
      if (!entry.params.response.url.includes('google-analytics')) return entry;

      const clonedEntry = JSON.parse(JSON.stringify(entry));
      const invalidTimings = {sslStart: -1, sslEnd: -1, connectStart: -1, connectEnd: -1};
      Object.assign(clonedEntry.params.response.timing, invalidTimings);

      return clonedEntry;
    });

    const result = await NetworkAnalysis.request(mutatedLog, {computedCache: new Map()});
    // If the connection timings were not removed, these estimates would be the same as in
    // the test above. However, without connection timings we fall back to a coarse estimate and
    // get slightly different results.
    expect(result.additionalRttByOrigin).toMatchInlineSnapshot(`
Map {
  "https://pwa.rocks" => 0.8417000135522703,
  "https://www.googletagmanager.com" => 0.4456999959075678,
  "https://www.google-analytics.com" => 0,
  "__SUMMARY__" => 0,
}
`);
    expect(result.serverResponseTimeByOrigin).toMatchInlineSnapshot(`
Map {
  "https://pwa.rocks" => 159.70249997917608,
  "https://www.googletagmanager.com" => 153.03200000198592,
  "https://www.google-analytics.com" => 161.04569999879467,
  "__SUMMARY__" => 159.70249997917608,
}
`);
  });
});
