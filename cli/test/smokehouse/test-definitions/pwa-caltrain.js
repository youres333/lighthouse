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
 * Expected Lighthouse results for caltrainschedule.io.
 */
const expectations = {
  lhr: {
    requestedUrl: 'https://caltrainschedule.io/',
    finalDisplayedUrl: 'https://caltrainschedule.io/',
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
  id: 'pwa-caltrain',
  expectations,
  config,
};
