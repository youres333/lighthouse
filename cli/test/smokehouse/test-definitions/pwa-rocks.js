/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import pwaDetailsExpectations from './pwa-expectations-details.js';

const pwaRocksExpectations = {...pwaDetailsExpectations, hasIconsAtLeast512px: false};

/** @type {LH.Config} */
const config = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['pwa'],
  },
};

/**
 * @type {Smokehouse.ExpectedRunnerResult}
 * Expected Lighthouse results for (the archived) pwa.rocks.
 */
const expectations = {
  lhr: {
    // Archived version of https://github.com/pwarocks/pwa.rocks
    // Fork is here: https://github.com/connorjclark/pwa.rocks
    requestedUrl: 'https://connorjclark.github.io/pwa.rocks/',
    finalDisplayedUrl: 'https://connorjclark.github.io/pwa.rocks/',
    audits: {
      'viewport': {
        score: 1,
      },
      'themed-omnibox': {
        score: 0,
        details: {items: [pwaRocksExpectations]},
      },
    },
  },
};

export default {
  id: 'pwa-rocks',
  expectations,
  config,
};
