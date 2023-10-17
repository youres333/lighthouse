/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import jestMock from 'jest-mock';
import {JSDOM} from 'jsdom';
import * as preact from 'preact';

function installJsdomHooks() {
  before(() => {
    // @ts-expect-error
    global.React = preact;

    const {window} = new JSDOM(undefined, {
      url: 'file:///Users/example/report.html/',
    });
    global.window = window;
    global.document = window.document;
    global.location = window.location;
    global.self = global.window;

    global.console.warn = jestMock.fn();

    // Use JSDOM types as necessary.
    global.Blob = window.Blob;
    global.HTMLElement = window.HTMLElement;
    global.HTMLInputElement = window.HTMLInputElement;
    global.CustomEvent = window.CustomEvent;
    global.window.ResizeObserver = class ResizeObserver {
      observe() { }
      unobserve() { }
    };


    // Functions not implemented in JSDOM.
    global.window.requestAnimationFrame = fn => fn();
    window.Element.prototype.scrollIntoView = jestMock.fn();
    global.self.matchMedia = jestMock.fn(() => ({
      addListener: jestMock.fn(),
    }));
    global.window.getComputedStyle = jestMock.fn(() => ({
      marginTop: '10px',
      height: '10px',
    }));
  });
}

export {
  installJsdomHooks,
};
