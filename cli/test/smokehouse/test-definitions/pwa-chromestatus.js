/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/** @type {LH.Config} */
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['pwa'],
  },
};

/**
 * @type {Smokehouse.ExpectedRunnerResult}
 * Expected Lighthouse results for chromestatus.com.
 */
const expectations = {
  lhr: {
    requestedUrl: 'https://chromestatus.com/features',
    finalDisplayedUrl: 'https://chromestatus.com/features',
    audits: {
      'viewport': {
        score: 1,
      },
      'themed-omnibox': {
        score: 0,
      },
    },
  },
};

export default {
  id: 'pwa-chromestatus',
  expectations,
  config,
};
