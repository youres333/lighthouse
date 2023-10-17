/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';

import * as lighthouseRenderer from '../../clients/bundle.js';
import {LH_ROOT} from '../../../shared/root.js';
import {installJsdomHooks} from '../setup/jsdom-setup.js';

const sampleResultsStr =
  fs.readFileSync(LH_ROOT + '/core/test/results/sample_v2.json', 'utf-8');

describe('lighthouseRenderer bundle', () => {
  installJsdomHooks();

  it('renders an LHR to DOM', () => {
    const lhr = /** @type {LH.Result} */ JSON.parse(sampleResultsStr);
    const reportContainer = document.body;
    reportContainer.classList.add('lh-vars', 'lh-root');

    const dom = new lighthouseRenderer.DOM(reportContainer.ownerDocument);
    const renderer = new lighthouseRenderer.ReportRenderer(dom);
    renderer.renderReport(lhr, reportContainer);
    const features = new lighthouseRenderer.ReportUIFeatures(renderer._dom);
    features.initFeatures(lhr);

    // Check that the report exists and has some content.
    expect(reportContainer instanceof document.defaultView.Element).toBeTruthy();
    expect(reportContainer.outerHTML.length).toBeGreaterThan(50000);

    const title = reportContainer.querySelector('.lh-audit-group--metrics')
      .querySelector('.lh-audit-group__title');
    expect(title.textContent).toEqual('Metrics');
  });
});
