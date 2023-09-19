/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import pwaDetailsExpectations from './pwa-expectations-details.js';

const jakeExpectations = {...pwaDetailsExpectations, hasShortName: false};

/** @type {LH.Config} */
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['pwa'],
  },
};

/**
 * @type {Smokehouse.ExpectedRunnerResult}
 * Expected Lighthouse results for svgomg.
 */
const expectations = {
  lhr: {
    runWarnings: {
      // In DevTools the IndexedDB storage from the initial load will persist into the Lighthouse run, emitting a warning.
      // For non-DevTools runners, this will revert to the default expectation of 0 run warnings.
      _runner: 'devtools',
      length: 1,
    },
    requestedUrl: 'https://jakearchibald.github.io/svgomg/',
    finalDisplayedUrl: 'https://jakearchibald.github.io/svgomg/',
    audits: {
      'viewport': {
        score: 1,
      },
      'themed-omnibox': {
        score: 1,
        details: {items: [jakeExpectations]},
      },
    },
  },
};

export default {
  id: 'pwa-svgomg',
  expectations,
  config,
};
