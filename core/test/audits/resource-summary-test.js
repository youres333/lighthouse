/**
 * @license Copyright 2019 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import ResourceSummaryAudit from '../../audits/resource-summary.js';
import {networkRecordsToDevtoolsLog} from '../network-records-to-devtools-log.js';

describe('Performance: Resource summary audit', () => {
  let artifacts;
  let context;
  beforeEach(() => {
    context = {computedCache: new Map(), settings: {budgets: null}};

    artifacts = {
      devtoolsLogs: {
        defaultPass: networkRecordsToDevtoolsLog([
          {url: 'http://example.com/file.html', resourceType: 'Document', transferSize: 30},
          {url: 'http://example.com/app.js', resourceType: 'Script', transferSize: 10},
          {url: 'http://my-cdn.com/bin.js', resourceType: 'Script', transferSize: 25},
          {url: 'http://third-party.com/script.js', resourceType: 'Script', transferSize: 50},
          {url: 'http://third-party.com/file.jpg', resourceType: 'Image', transferSize: 70},
          {url: 'http://example.com/bad.js', resourceType: 'Image', transferSize: 0},
          {url: 'data:image/jpeg;base64,', resourceType: 'Image', transferSize: 100_000},
        ]),
      },
      URL: {requestedUrl: 'http://example.com', mainDocumentUrl: 'http://example.com', finalDisplayedUrl: 'http://example.com'},
    };
  });

  it('has the correct score', async () => {
    const result = await ResourceSummaryAudit.audit(artifacts, context);
    expect(result.score).toBe(1);
  });

  it('has the correct display value', async () => {
    const result = await ResourceSummaryAudit.audit(artifacts, context);
    expect(result.displayValue).toBeDisplayString('6 requests • 0 KiB');
  });

  describe('summary table', () => {
    it('has three table columns', async () => {
      const result = await ResourceSummaryAudit.audit(artifacts, context);
      const table = result.details.items[0];
      expect(table.headings).toHaveLength(3);
    });

    it('includes the correct properties for each table item', async () => {
      const result = await ResourceSummaryAudit.audit(artifacts, context);
      const table = result.details.items[0];
      const item = table.items[0];
      expect(item.resourceType).toEqual('total');
      expect(item.label).toBeDisplayString('Total');
      expect(item.requestCount).toBe(6);
      expect(item.transferSize).toBe(185);
    });

    it('includes all resource types, regardless of whether page contains them', async () => {
      const result = await ResourceSummaryAudit.audit(artifacts, context);
      const table = result.details.items[0];
      expect(Object.keys(table.items)).toHaveLength(9);
    });

    it('it displays "0" if there are no resources of that type', async () => {
      const result = await ResourceSummaryAudit.audit(artifacts, context);
      const table = result.details.items[0];
      const fontItem = table.items.find(item => item.resourceType === 'font');
      expect(fontItem.requestCount).toBe(0);
      expect(fontItem.transferSize).toBe(0);
    });
    describe('third-party resource identification', () => {
      it('is based on root domain if firstPartyHostnames is NOT set', async () => {
        const result = await ResourceSummaryAudit.audit(artifacts, context);
        const table = result.details.items[0];
        const thirdParty = table.items
          .find(item => item.resourceType === 'third-party');
        expect(thirdParty.transferSize).toBe(145);
        expect(thirdParty.requestCount).toBe(3);
      });

      it('uses firstPartyHostnames if provided', async () => {
        context.settings.budgets = [{
          path: '/',
          options: {
            firstPartyHostnames: ['example.com', 'my-cdn.com'],
          },
        }];
        const result = await ResourceSummaryAudit.audit(artifacts, context);
        const table = result.details.items[0];
        const thirdParty = table.items
          .find(item => item.resourceType === 'third-party');
        expect(thirdParty.transferSize).toBe(120);
        expect(thirdParty.requestCount).toBe(2);
      });
    });

    describe('table ordering', () => {
      it('except for the last row, it sorts items by size (descending)', async () => {
        const result = await ResourceSummaryAudit.audit(artifacts, context);
        const table = result.details.items[0];
        const items = table.items;
        items.slice(0, -2).forEach((item, index) => {
          expect(item.transferSize).toBeGreaterThanOrEqual(items[index + 1].transferSize);
        });
      });

      it('"Total" is the first row', async () => {
        const result = await ResourceSummaryAudit.audit(artifacts, context);
        const table = result.details.items[0];
        expect(table.items[0].resourceType).toBe('total');
      });

      it('"Third-party" is the last-row', async () => {
        const result = await ResourceSummaryAudit.audit(artifacts, context);
        const table = result.details.items[0];
        const items = table.items;
        expect(items[items.length - 1].resourceType).toBe('third-party');
      });
    });
  });

  describe('request table', () => {
    it('filters to correct records', async () => {
      const result = await ResourceSummaryAudit.audit(artifacts, context);
      const table = result.details.items[1];
      expect(table.items.map(item => item.url)).toEqual([
        'http://third-party.com/file.jpg',
        'http://third-party.com/script.js',
        'http://example.com/file.html',
        'http://my-cdn.com/bin.js',
        'http://example.com/app.js',
      ]);
    });
  });
});
