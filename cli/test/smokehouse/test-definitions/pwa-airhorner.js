/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import pwaDetailsExpectations from './pwa-expectations-details.js';

/** @type {LH.Config} */
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['pwa'],
  },
};

/**
 * @type {Smokehouse.ExpectedRunnerResult}
 * Expected Lighthouse results for airhorner.com.
 */
const expectations = {
  lhr: {
    requestedUrl: 'https://airhorner.com',
    finalDisplayedUrl: 'https://airhorner.com/',
    audits: {
      'viewport': {
        score: 1,
      },
      'themed-omnibox': {
        score: 1,
        details: {items: [{...pwaDetailsExpectations, themeColor: '#2196F3'}]},
      },
    },
  },
};

export default {
  id: 'pwa-airhorner',
  expectations,
  config,
};
